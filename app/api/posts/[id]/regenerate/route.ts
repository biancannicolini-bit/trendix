import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canGenerateForUser } from "@/lib/generation";
import {
  parseServiceError,
  parseFetchError,
  humanizeGenerationError,
} from "@/lib/service-errors";
import type { Prisma } from "@prisma/client";

type RegeneratedPost = {
  title: string;
  hook: string;
  script: Prisma.InputJsonValue;
  caption: string;
  hashtags: string[];
  format: string;
  duration: string;
  production_note?: string | null;
  sources?: string[];
};

type RegenerateUsage = {
  model: string;
  tokens_input: number;
  tokens_output: number;
  cost_usd: number;
  duration_ms: number;
};

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;

  const post = await prisma.post.findUnique({ where: { id } });
  if (!post || post.userId !== session.user.id) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { profile: true, subscription: true },
  });
  if (!user?.profile) {
    return NextResponse.json({ error: "Falta completar tu perfil." }, { status: 400 });
  }
  if (!canGenerateForUser(user)) {
    return NextResponse.json(
      { error: "Necesitás una suscripción activa para regenerar." },
      { status: 403 }
    );
  }

  try {
    const res = await fetch(`${process.env.PYTHON_SERVICE_URL}/regenerate-post`, {
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
        day: post.day,
        platform: post.platform,
        pillar: post.pillar,
        avoid_title: post.title,
      }),
      // Búsqueda web suma latencia.
      signal: AbortSignal.timeout(300_000),
    });

    if (!res.ok) {
      throw new Error(await parseServiceError(res));
    }

    const { post: generated, usage } = (await res.json()) as {
      post: RegeneratedPost;
      usage: RegenerateUsage;
    };

    const [updated] = await prisma.$transaction([
      prisma.post.update({
        where: { id: post.id },
        data: {
          title: generated.title,
          hook: generated.hook,
          script: generated.script,
          caption: generated.caption,
          hashtags: generated.hashtags,
          format: generated.format,
          duration: generated.duration,
          productionNote: generated.production_note ?? null,
          sources: generated.sources ?? [],
          completed: false,
          completedAt: null,
          regenerationCount: { increment: 1 },
        },
      }),
      prisma.aiUsageLog.create({
        data: {
          userId: user.id,
          calendarId: post.calendarId,
          postId: post.id,
          callType: "single_regen",
          model: usage.model,
          tokensInput: usage.tokens_input,
          tokensOutput: usage.tokens_output,
          costUsd: usage.cost_usd,
        },
      }),
    ]);

    return NextResponse.json({ ok: true, id: updated.id });
  } catch (e) {
    const message = humanizeGenerationError(parseFetchError(e));
    console.error(`[regenerate] post=${post.id} error=${message}`);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
