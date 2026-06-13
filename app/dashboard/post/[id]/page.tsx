import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { redirect } from "next/navigation";

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
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <Link href="/dashboard" className="text-sm font-medium text-gray-600">
        ← Volver al calendario
      </Link>

      <div className="mt-6 space-y-6 rounded-lg border border-gray-200 bg-white p-6">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">
            {post.platform} · {post.pillar}
          </p>
          <h1 className="mt-2 text-2xl font-semibold">{post.title}</h1>
          <p className="mt-2 text-sm text-gray-600">{post.hook}</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Guion</h2>
          <div className="space-y-4">
            {script.map((section, index) => (
              <div
                key={index}
                className="rounded-md border border-gray-200 p-3"
              >
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                  <span className="font-semibold text-gray-700">
                    {section.section}
                  </span>
                  <span>{section.timing}</span>
                  <span>· {section.direction}</span>
                </div>
                <ul className="mt-2 space-y-1 text-sm text-gray-800">
                  {section.lines?.map((line, i) => (
                    <li key={i}>• {line}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Caption</h2>
          <div className="whitespace-pre-line rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-800">
            {post.caption}
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Hashtags</h2>
          <div className="flex flex-wrap gap-2">
            {post.hashtags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>

        {post.productionNote && (
          <section className="space-y-2">
            <h2 className="text-lg font-semibold">Nota de producción</h2>
            <p className="text-sm text-gray-700">{post.productionNote}</p>
          </section>
        )}
      </div>
    </main>
  );
}
