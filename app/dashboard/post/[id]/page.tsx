import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import {
  PostDetail,
  type ScriptSection,
} from "@/components/dashboard/PostDetail";

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

  return (
    <PostDetail
      postId={post.id}
      post={{
        title: post.title,
        platform: post.platform,
        pillar: post.pillar,
        format: post.format,
        duration: post.duration,
        day: post.day,
        hook: post.hook,
        script: post.script as ScriptSection[],
        caption: post.caption,
        hashtags: post.hashtags,
        productionNote: post.productionNote,
        sources: post.sources,
      }}
    />
  );
}
