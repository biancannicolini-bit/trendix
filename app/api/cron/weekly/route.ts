import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendEmail, sendWhatsApp } from "@/lib/notifications";
import { getNextWeekStart } from "@/lib/dates";
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

export async function POST(req: NextRequest) {
  const auth = req.headers.get("Authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const targetUserId = body.userId as string | undefined;

  const users = (
    await prisma.user.findMany({
      where: {
        ...(targetUserId ? { id: targetUserId } : {}),
        subscription: { status: "authorized" },
        profile: { isNot: null },
      },
      include: { profile: true, subscription: true },
    })
  ).filter((u): u is UserWithProfile => u.profile !== null);

  const results = await Promise.allSettled(users.map(processUser));
  const succeeded = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  return NextResponse.json({ processed: users.length, succeeded, failed });
}

async function processUser(user: UserWithProfile) {
  const weekStart = getNextWeekStart();

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

  let retries = 0;
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

      if (!res.ok) throw new Error(`Python service ${res.status}`);

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
        sendEmail(user.email, user.name),
        sendWhatsApp(user.phone, user.name),
      ]);

      return;
    } catch (e: unknown) {
      retries++;
      const message = e instanceof Error ? e.message : "Unknown error";
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
      await new Promise((r) => setTimeout(r, 60_000 * retries));
    }
  }
}
