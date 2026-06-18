import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { CopyButton } from "@/components/ui/CopyButton";
import { HookBar } from "@/components/ui/HookBar";
import { PlatformIcon } from "@/components/ui/PlatformIcon";
import { RegenerateButton } from "@/components/ui/RegenerateButton";

export type ScriptSection = {
  section: string;
  timing: string;
  direction: string;
  lines?: string[];
};

export type PostDetailData = {
  title: string;
  platform: string;
  pillar: string;
  format: string;
  duration: string;
  day: string;
  hook: string;
  script: ScriptSection[];
  caption: string;
  hashtags: string[];
  productionNote?: string | null;
};

function scriptToText(script: ScriptSection[]) {
  return script
    .map((s) => {
      const head = [s.section, s.timing, s.direction].filter(Boolean).join(" · ");
      const body = (s.lines ?? []).join("\n");
      return body ? `${head}\n${body}` : head;
    })
    .join("\n\n");
}

export function PostDetail({
  post,
  postId,
  backHref = "/dashboard",
  demo = false,
}: {
  post: PostDetailData;
  postId?: string;
  backHref?: string;
  demo?: boolean;
}) {
  const meta = [post.day, post.format, post.duration].filter(Boolean);

  return (
    <div className="mx-auto max-w-2xl animate-fade-in-up space-y-8">
      <div className="flex items-center justify-between gap-3">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 text-sm font-medium text-text-secondary transition-colors hover:text-brand-pink"
        >
          ← Volver al calendario
        </Link>
        {postId && <RegenerateButton postId={postId} demo={demo} />}
      </div>

      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 text-[13px] text-text-secondary">
            <PlatformIcon platform={post.platform} className="text-text-tertiary" />
            {post.platform}
          </span>
          <Badge>{post.pillar}</Badge>
          {meta.map((m, i) => (
            <span key={i} className="text-[11px] text-text-tertiary">
              · {m}
            </span>
          ))}
        </div>
        <h1 className="text-[30px] font-medium leading-tight tracking-[-1px]">
          {post.title}
        </h1>
        <HookBar>{post.hook}</HookBar>
      </header>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <SectionLabel>Guion</SectionLabel>
          <CopyButton text={scriptToText(post.script)} label="Copiar guion" />
        </div>
        <div className="space-y-5">
          {post.script.map((s, i) => (
            <div
              key={i}
              className="border-l-2 border-[var(--color-border-tertiary)] pl-4"
            >
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px]">
                <span className="font-medium uppercase tracking-wide text-brand-pink">
                  {s.section}
                </span>
                {s.timing && <span className="text-text-tertiary">{s.timing}</span>}
                {s.direction && (
                  <span className="text-text-tertiary">· {s.direction}</span>
                )}
              </div>
              <ul className="mt-2 space-y-1.5 text-[15px] leading-relaxed text-text-primary">
                {s.lines?.map((line, j) => (
                  <li key={j}>{line}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <SectionLabel>Caption</SectionLabel>
          <CopyButton text={post.caption} />
        </div>
        <div className="whitespace-pre-line rounded-lg border border-[var(--color-border-tertiary)] bg-bg-primary p-4 text-sm leading-relaxed text-text-primary shadow-[0_1px_2px_rgba(23,9,14,0.04)]">
          {post.caption}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <SectionLabel>Hashtags</SectionLabel>
          <CopyButton text={post.hashtags.join(" ")} />
        </div>
        <div className="flex flex-wrap gap-2">
          {post.hashtags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-[var(--color-border-tertiary)] bg-bg-primary px-3 py-1 text-xs text-text-secondary"
            >
              {tag}
            </span>
          ))}
        </div>
      </section>

      {post.productionNote && (
        <section className="space-y-2">
          <SectionLabel>Nota de producción</SectionLabel>
          <div className="rounded-lg border border-[var(--color-border-tertiary)] bg-bg-secondary p-4 text-sm leading-relaxed text-text-secondary">
            {post.productionNote}
          </div>
        </section>
      )}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-medium tracking-[-0.5px]">{children}</h2>;
}
