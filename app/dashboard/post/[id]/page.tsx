import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { HookBar } from "@/components/ui/HookBar";
import { BRAND } from "@/lib/brand";

type ScriptSection = {
  section: string;
  timing: string;
  direction: string;
  lines?: string[];
};

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
  });

  if (!post || post.userId !== session.user.id) {
    redirect("/dashboard");
  }

  const script = post.script as ScriptSection[];

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in-up">
      <Link
        href="/dashboard"
        className="inline-flex text-sm font-medium text-text-secondary transition-colors hover:text-brand-pink"
      >
        ← Volver al calendario
      </Link>

      <Card className="space-y-8">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{post.pillar}</Badge>
            <span className="text-[11px] text-text-tertiary">{post.platform}</span>
            {post.format && (
              <span className="text-[11px] text-text-tertiary">
                · {post.format}
              </span>
            )}
          </div>
          <h1 className="text-[28px] font-medium tracking-[-0.5px] leading-tight">
            {post.title}
          </h1>
          <HookBar>{post.hook}</HookBar>
        </div>

        <section className="space-y-4">
          <h2 className="text-lg font-medium tracking-[-0.5px]">Guion</h2>
          <div className="space-y-3">
            {script.map((section, index) => (
              <div
                key={index}
                className="rounded-md border border-[var(--color-border-tertiary)] p-4 transition-colors duration-200"
              >
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-text-tertiary">
                  <span className="font-medium text-text-secondary">
                    {section.section}
                  </span>
                  <span>{section.timing}</span>
                  <span>· {section.direction}</span>
                </div>
                <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-text-primary">
                  {section.lines?.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium tracking-[-0.5px]">Caption</h2>
          <div className="whitespace-pre-line rounded-md border border-[var(--color-border-tertiary)] bg-bg-secondary p-4 text-sm leading-relaxed text-text-primary">
            {post.caption}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium tracking-[-0.5px]">Hashtags</h2>
          <div className="flex flex-wrap gap-2">
            {post.hashtags.map((tag) => (
              <span
                key={tag}
                className="rounded-full px-3 py-1 text-xs text-text-secondary"
                style={{ background: BRAND.LIGHT }}
              >
                {tag}
              </span>
            ))}
          </div>
        </section>

        {post.productionNote && (
          <section className="space-y-2">
            <h2 className="text-lg font-medium tracking-[-0.5px]">
              Nota de producción
            </h2>
            <p className="text-sm leading-relaxed text-text-secondary">
              {post.productionNote}
            </p>
          </section>
        )}
      </Card>
    </div>
  );
}
