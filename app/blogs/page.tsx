import Image from "next/image";
import Link from "next/link";
import { BookOpenText, CalendarDays, UserRound } from "lucide-react";
import { PageShell } from "@/components/landing/PageShell";
import { getPublishedBlogPosts } from "@/lib/blog-posts";
import type { BlogPost } from "@/lib/blog-types";

export const dynamic = "force-dynamic";

export default async function BlogsPage() {
  let posts: BlogPost[] = [];
  let loadError = false;
  try {
    posts = await getPublishedBlogPosts();
  } catch (error) {
    console.error("Unable to render public blog list.", error);
    posts = [];
    loadError = true;
  }

  return (
    <PageShell>
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-indigo-50/60 to-white pb-16 pt-14 sm:pb-20 sm:pt-20">
        <div className="pointer-events-none absolute -right-20 -top-24 size-80 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 size-80 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Buildexom insights</p>
          <h1 className="mx-auto mt-4 max-w-3xl text-center text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">Ideas to help your business grow</h1>
          <p className="mx-auto mt-4 max-w-2xl text-center text-base leading-7 text-slate-600">Practical guidance on e-commerce, online selling, and building a better customer experience.</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        {loadError ? (
          <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-center text-sm text-amber-900">Blog articles are temporarily unavailable. Please try again shortly.</p>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
            <BookOpenText className="mx-auto text-blue-300" size={32} />
            <h2 className="mt-4 text-lg font-semibold text-slate-800">New articles coming soon</h2>
            <p className="mt-2 text-sm text-slate-500">There are no published blog posts just yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article key={post.id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-950/10">
                <Link href={`/blogs/${encodeURIComponent(post.slug)}`} className="block">
                  {post.cover_image ? (
                    <div className="relative h-52 overflow-hidden bg-slate-100">
                      <Image unoptimized src={post.cover_image} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition duration-300 group-hover:scale-105" />
                    </div>
                  ) : (
                    <div className="relative grid h-52 place-items-center overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-700 to-violet-800 text-white">
                      <div className="absolute -right-8 -top-10 size-40 rounded-full bg-white/10" />
                      <BookOpenText size={42} strokeWidth={1.5} className="relative" />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-slate-500">
                      <span className="inline-flex items-center gap-1.5"><CalendarDays size={13} />{new Date(post.published_at!).toLocaleDateString()}</span>
                      <span className="inline-flex items-center gap-1.5"><UserRound size={13} />{post.author}</span>
                    </div>
                    <h2 className="mt-3 text-lg font-semibold leading-6 text-slate-900 transition-colors group-hover:text-blue-700">{post.title}</h2>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{post.excerpt || post.content.slice(0, 180)}</p>
                    <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700">Read article <span aria-hidden="true">→</span></span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
