import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, UserRound } from "lucide-react";
import { PageShell } from "@/components/landing/PageShell";
import { getPublishedBlogPost } from "@/lib/blog-posts";
import { getPlatformSettings } from "@/lib/platform-settings";
import type { BlogPost } from "@/lib/blog-types";

type Props = { params: Promise<{ slug: string }> };

async function loadPost(slug: string) {
  return getPublishedBlogPost(slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await loadPost(slug);
  if (!post) return { title: "Article not found" };

  const settings = await getPlatformSettings();
  const seoTitle = post.seo_meta?.title || post.title;
  const description = post.seo_meta?.description || post.excerpt;
  const keywords = post.seo_meta?.keywords?.length ? post.seo_meta.keywords : undefined;
  const image = post.cover_image || settings.defaultSocialImage || undefined;

  return {
    title: seoTitle,
    description,
    ...(keywords ? { keywords } : {}),
    openGraph: {
      type: "article",
      title: seoTitle,
      description,
      publishedTime: post.published_at ?? undefined,
      authors: [post.author],
      ...(image ? { images: [image] } : {}),
    },
    ...(image ? { twitter: { card: "summary_large_image", images: [image] } } : {}),
  };
}

function Content({ post }: { post: BlogPost }) {
  const paragraphs = post.content.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);
  return (
    <div className="space-y-6">
      {paragraphs.map((paragraph, index) => (
        <p key={index} className={index === 0 ? "text-lg font-medium leading-8 text-slate-800 sm:text-xl" : "whitespace-pre-wrap text-base leading-8 text-slate-600"}>
          {paragraph}
        </p>
      ))}
    </div>
  );
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await loadPost(slug);
  if (!post) notFound();

  return (
    <PageShell>
      <article>
        <header className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-700 to-violet-800 py-14 text-white sm:py-20">
          <div className="pointer-events-none absolute -right-20 -top-24 size-80 rounded-full bg-white/10 blur-2xl" />
          <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
            <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-sm text-blue-100">
              <Link href="/" className="hover:text-white">Home</Link><span>/</span><Link href="/blogs" className="hover:text-white">Blogs</Link>
            </nav>
            <Link href="/blogs" className="inline-flex items-center gap-2 text-xs font-semibold text-blue-100 transition hover:text-white"><ArrowLeft size={14} />All articles</Link>
            <h1 className="mt-6 text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">{post.title}</h1>
            {post.excerpt && <p className="mt-5 max-w-3xl text-base leading-7 text-blue-50 sm:text-lg">{post.excerpt}</p>}
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-blue-100">
              <span className="inline-flex items-center gap-2"><UserRound size={14} />{post.author}</span>
              {post.published_at && <span className="inline-flex items-center gap-2"><CalendarDays size={14} />{new Date(post.published_at).toLocaleDateString()}</span>}
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-4xl px-4 pb-20 sm:px-6">
          {post.cover_image && (
            <div className="relative -mt-8 mb-10 h-56 overflow-hidden rounded-2xl border-4 border-white bg-slate-100 shadow-xl sm:h-96">
              <Image unoptimized src={post.cover_image} alt="" fill sizes="(max-width: 768px) 100vw, 896px" className="object-cover" priority />
            </div>
          )}
          <div className="mx-auto max-w-3xl rounded-2xl border border-slate-100 bg-white px-1 py-8 sm:px-8 sm:py-10">
            <Content post={post} />
          </div>
        </div>
      </article>
    </PageShell>
  );
}
