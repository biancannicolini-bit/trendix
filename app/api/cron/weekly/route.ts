import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { processUser } from "@/lib/generation";
import type { Profile, Subscription, User } from "@prisma/client";

type UserWithProfile = User & {
  profile: Profile;
  subscription: Subscription | null;
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
