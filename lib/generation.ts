import { prisma } from "@/lib/db";
import { sendEmail, sendWhatsApp } from "@/lib/notifications";
import { getCurrentWeekStart, getNextWeekStart } from "@/lib/dates";
import { isAdminEmail } from "@/lib/admin";
import { parseFetchError, parseServiceError, humanizeGenerationError } from "@/lib/service-errors";
import type { Profile, Subscription, User } from "@prisma/client";
import type { Prisma } from "@prisma/client";

type UserWithProfile = User & {
  profile: Profile;
  subscription: Subscription | null;
};

type GeneratedPost = {
  day: string;
  platform: string;
  pillar: string;
  title: string;
  hook: string;
  script: Prisma.InputJsonValue;
  caption: string;
  hashtags: string[];
  format: string;
  duration: string;
  production_note?: string | null;
};

type GenerateUsage = {
  model: string;
  tokens_input: number;
  tokens_output: number;
  cost_usd: number;
  duration_ms: number;
};

export async function getWeekStartForGeneration(userId: string): Promise<Date> {
  const hasReady = await prisma.contentCalendar.findFirst({
    where: { userId, status: "ready" },
  });
  return hasReady ? getNextWeekStart() : getCurrentWeekStart();
}

export function subscriptionHasAccess(sub: Subscription | null): boolean {
  if (!sub || sub.status !== "authorized") return false;
  if (sub.method === "one_time") {
    return !!sub.accessUntil && sub.accessUntil > new Date();
  }
  return true;
}

export function canGenerateForUser(user: {
  email: string;
  subscription: Subscription | null;
}): boolean {
  return subscriptionHasAccess(user.subscription) || isAdminEmail(user.email);
}

export async function processUser(user: UserWithProfile) {
  const weekStart = await getWeekStartForGeneration(user.id);

  const existing = await prisma.contentCalendar.findUnique({
    where: { userId_weekStart: { userId: user.id, weekStart } },
  });
  if (existing?.status === "ready") return;

  const calendar =
    existing ??
    (await prisma.contentCalendar.create({
      data: { userId: user.id, weekStart, status: "generating" },
    }));

  if (existing && existing.status !== "ready") {
    await prisma.post.deleteMany({ where: { calendarId: calendar.id } });
  }

  await prisma.contentCalendar.update({
    where: { id: calendar.id },
    data: { status: "generating", errorMessage: null },
  });

  let retries = 0;
  const retryDelaysMs = [0, 5_000, 10_000];

  while (retries < 3) {
    try {
      const res = await fetch(`${process.env.PYTHON_SERVICE_URL}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.INTERNAL_API_KEY}`,
        },
        body: JSON.stringify({
          niche: user.profile.niche,
          custom_niche: user.profile.customNiche,
          audience: user.profile.audience,
          location: user.profile.location,
          platforms: user.profile.platforms,
          tone: user.profile.tone,
          language: user.profile.language,
          frequency: user.profile.frequency,
        }),
        signal: AbortSignal.timeout(120_000),
      });

      if (!res.ok) {
        throw new Error(await parseServiceError(res));
      }

      const { posts, trends_found, usage } = (await res.json()) as {
        posts: GeneratedPost[];
        trends_found: string[];
        usage: GenerateUsage;
      };

      await prisma.$transaction([
        prisma.post.createMany({
          data: posts.map((p) => ({
            calendarId: calendar.id,
            userId: user.id,
            day: p.day,
            platform: p.platform,
            pillar: p.pillar,
            title: p.title,
            hook: p.hook,
            script: p.script,
            caption: p.caption,
            hashtags: p.hashtags,
            format: p.format,
            duration: p.duration,
            productionNote: p.production_note ?? null,
          })),
        }),
        prisma.contentCalendar.update({
          where: { id: calendar.id },
          data: {
            status: "ready",
            trendsUsed: trends_found,
            tokensInput: usage.tokens_input,
            tokensOutput: usage.tokens_output,
            costUsd: usage.cost_usd,
            modelUsed: usage.model,
            durationMs: usage.duration_ms,
          },
        }),
        prisma.aiUsageLog.create({
          data: {
            userId: user.id,
            calendarId: calendar.id,
            callType: "weekly_generation",
            model: usage.model,
            tokensInput: usage.tokens_input,
            tokensOutput: usage.tokens_output,
            costUsd: usage.cost_usd,
          },
        }),
      ]);

      Promise.allSettled([
        sendEmail(user.email, user.name, posts.length),
        sendWhatsApp(user.phone, user.name, posts.length),
      ]);

      return;
    } catch (e: unknown) {
      retries++;
      const message = humanizeGenerationError(parseFetchError(e));
      console.error(
        `[generation] user=${user.id} attempt=${retries}/3 error=${message}`
      );
      if (retries >= 3) {
        await prisma.contentCalendar.update({
          where: { id: calendar.id },
          data: { status: "error", errorMessage: message },
        });
        await prisma.generationError.create({
          data: {
            userId: user.id,
            calendarId: calendar.id,
            errorType: "generation_failed",
            errorMessage: message,
            retryCount: retries,
          },
        });
        throw e;
      }
      await new Promise((r) =>
        setTimeout(r, retryDelaysMs[retries] ?? 10_000)
      );
    }
  }
}

export async function runGenerationForUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true, subscription: true },
  });

  if (!user?.profile) return { skipped: "no_profile" as const };
  if (!canGenerateForUser(user)) return { skipped: "not_authorized" as const };

  await processUser(user as UserWithProfile);
  return { ok: true as const };
}

export function triggerUserGeneration(userId: string) {
  void runGenerationForUser(userId).catch((e) =>
    console.error("Generation failed for user", userId, e)
  );
}
