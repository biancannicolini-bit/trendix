import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseFetchError } from "@/lib/service-errors";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const pythonUrl = process.env.PYTHON_SERVICE_URL ?? "http://python:8000";
  const checks: Record<string, unknown>[] = [];

  try {
    const res = await fetch(`${pythonUrl}/health`, {
      signal: AbortSignal.timeout(8000),
    });
    const body = await res.json().catch(() => ({}));
    checks.push({
      name: "python_health",
      ok: res.ok,
      status: res.status,
      ...body,
    });
  } catch (error) {
    checks.push({
      name: "python_health",
      ok: false,
      error: parseFetchError(error),
    });
  }

  const lastError = await prisma.generationError.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      errorMessage: true,
      errorType: true,
      retryCount: true,
      createdAt: true,
    },
  });

  const lastCalendar = await prisma.contentCalendar.findFirst({
    where: { userId: session.user.id },
    orderBy: { generatedAt: "desc" },
    select: { status: true, errorMessage: true, generatedAt: true },
  });

  return NextResponse.json({
    checks,
    lastError,
    lastCalendar,
    appConfigured: {
      pythonUrl,
      hasInternalKey: Boolean(process.env.INTERNAL_API_KEY),
    },
  });
}
