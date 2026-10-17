"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookOpenText, ExternalLink, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import type { BlogPost, BlogPostInput, BlogSeoMeta } from "@/lib/blog-types";

type EditorValues = {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  coverImage: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string;
};

const emptyEditor: EditorValues = {
  title: "",
  slug: "",
  content: "",
  excerpt: "",
  author: "Buildexom Team",
  publishedAt: "",
  coverImage: "",
  seoTitle: "",
  seoDescription: "",
  keywords: "",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isBlogSeoMeta(value: unknown): value is BlogSeoMeta {
  return isRecord(value)
    && (value.title === undefined || typeof value.title === "string")
    && (value.description === undefined || typeof value.description === "string")
    && (value.keywords === undefined || (Array.isArray(value.keywords) && value.keywords.every((keyword) => typeof keyword === "string")));
}

function isBlogPost(value: unknown): value is BlogPost {
  if (!isRecord(value)) return false;
  return ["id", "title", "slug", "content", "excerpt", "author", "created_at", "updated_at"]
    .every((key) => typeof value[key] === "string")
    && (value.published_at === null || typeof value.published_at === "string")
    && (value.cover_image === null || typeof value.cover_image === "string")
    && isBlogSeoMeta(value.seo_meta);
}

async function responseJson(response: Response): Promise<Record<string, unknown>> {
  let result: unknown;
  try {
    result = await response.json();
  } catch {
    throw new Error("The blog service returned an invalid response.");
  }
  if (!isRecord(result)) throw new Error("The blog service returned an invalid response.");
  if (!response.ok) throw new Error(typeof result.error === "string" ? result.error : "Unable to complete the blog request.");
  return result;
}

function toDateTimeLocal(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function makeEditor(post: BlogPost): EditorValues {
  const meta = post.seo_meta;
  return {
    title: post.title,
    slug: post.slug,
    content: post.content,
    excerpt: post.excerpt,
    author: post.author,
    publishedAt: toDateTimeLocal(post.published_at),
    coverImage: post.cover_image ?? "",
    seoTitle: meta.title ?? "",
    seoDescription: meta.description ?? "",
    keywords: meta.keywords?.join(", ") ?? "",
  };
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function publishedLabel(value: string | null) {
  if (!value) return "Draft";
  const date = new Date(value);
  return date > new Date() ? `Scheduled ${date.toLocaleDateString()}` : `Published ${date.toLocaleDateString()}`;
}

export function DashboardBlogs() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [values, setValues] = useState<EditorValues>(emptyEditor);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/blogs", { cache: "no-store" })
      .then(responseJson)
      .then((result) => {
        const loadedPosts = result.posts;
        if (!Array.isArray(loadedPosts) || !loadedPosts.every(isBlogPost)) {
          throw new Error("The blog service returned invalid posts.");
        }
        if (active) setPosts(loadedPosts);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "Unable to load blog posts.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  function beginCreate() {
    setEditorOpen(true);
    setEditingId(null);
    setValues(emptyEditor);
    setSlugManuallyEdited(false);
    setError(null);
  }

  function beginEdit(post: BlogPost) {
    setEditorOpen(true);
    setEditingId(post.id);
    setValues(makeEditor(post));
    setSlugManuallyEdited(true);
    setError(null);
  }

  async function savePost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    let publishedAt: string | null = null;
    try {
      publishedAt = values.publishedAt ? new Date(values.publishedAt).toISOString() : null;
      const payload: BlogPostInput = {
        title: values.title,
        slug: slugify(values.slug),
        content: values.content,
        excerpt: values.excerpt,
        author: values.author,
        published_at: publishedAt,
        cover_image: values.coverImage || null,
        seo_meta: {
          ...(values.seoTitle.trim() ? { title: values.seoTitle.trim() } : {}),
          ...(values.seoDescription.trim() ? { description: values.seoDescription.trim() } : {}),
          keywords: values.keywords.split(",").map((keyword) => keyword.trim()).filter(Boolean),
        },
      };
      const response = await fetch(editingId ? `/api/admin/blogs/${encodeURIComponent(editingId)}` : "/api/admin/blogs", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await responseJson(response);
      const savedPost = result.post;
      if (!isBlogPost(savedPost)) throw new Error("The blog service returned an invalid post.");
      setPosts((current) => [savedPost, ...current.filter((post) => post.id !== savedPost.id)]);
      setEditingId(null);
      setEditorOpen(false);
      setValues(emptyEditor);
      setSlugManuallyEdited(false);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save blog post.");
    } finally {
      setSaving(false);
    }
  }

  async function deletePost(post: BlogPost) {
    if (!window.confirm(`Delete “${post.title}”? This cannot be undone.`)) return;
    setError(null);
    try {
      const response = await fetch(`/api/admin/blogs/${encodeURIComponent(post.id)}`, { method: "DELETE" });
      await responseJson(response);
      setPosts((current) => current.filter((item) => item.id !== post.id));
      if (editingId === post.id) {
        setEditingId(null);
        setEditorOpen(false);
        setValues(emptyEditor);
        setSlugManuallyEdited(false);
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to delete blog post.");
    }
  }

  const inputClass = "mt-1.5 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
  const textareaClass = "mt-1.5 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-blue-700">Platform management</p>
          <h2 className="mt-1.5 text-[25px] font-semibold tracking-tight text-slate-900">Blogs</h2>
          <p className="mt-1 text-sm text-slate-500">Create and manage public articles, publication dates, and search metadata.</p>
        </div>
        <button type="button" onClick={beginCreate} className="inline-flex h-10 items-center gap-2 rounded-md bg-blue-600 px-4 text-xs font-semibold text-white hover:bg-blue-700">
          <Plus size={15} /> New blog post
        </button>
      </div>

      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h3 className="text-sm font-semibold text-slate-800">All blog posts</h3>
          <p className="mt-1 text-[11px] text-slate-500">{posts.length} posts in your database</p>
        </div>
        {loading ? (
          <p role="status" className="px-5 py-12 text-center text-sm text-slate-500">Loading blog posts…</p>
        ) : posts.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <BookOpenText className="mx-auto text-slate-300" size={28} />
            <p className="mt-3 text-sm font-medium text-slate-700">No blog posts yet</p>
            <p className="mt-1 text-xs text-slate-500">Create your first article to publish it on the public blog.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {posts.map((post) => (
              <article key={post.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                {post.cover_image ? (
                  <Image unoptimized src={post.cover_image} alt="" width={64} height={48} className="h-12 w-16 rounded-md bg-slate-100 object-cover" />
                ) : (
                  <div className="grid h-12 w-16 place-items-center rounded-md bg-gradient-to-br from-blue-600 to-indigo-700 text-white"><BookOpenText size={19} /></div>
                )}
                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-sm font-semibold text-slate-800">{post.title}</h4>
                  <p className="mt-1 truncate text-xs text-slate-500">/{post.slug} · {post.author}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${post.published_at && new Date(post.published_at) <= new Date() ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                  {publishedLabel(post.published_at)}
                </span>
                {post.published_at && new Date(post.published_at) <= new Date() && (
                  <Link href={`/blogs/${encodeURIComponent(post.slug)}`} target="_blank" rel="noreferrer" className="grid size-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100" aria-label={`View ${post.title}`}><ExternalLink size={15} /></Link>
                )}
                <button type="button" onClick={() => beginEdit(post)} className="grid size-8 place-items-center rounded-md text-blue-700 hover:bg-blue-50" aria-label={`Edit ${post.title}`}><Pencil size={15} /></button>
                <button type="button" onClick={() => void deletePost(post)} className="grid size-8 place-items-center rounded-md text-red-600 hover:bg-red-50" aria-label={`Delete ${post.title}`}><Trash2 size={15} /></button>
              </article>
            ))}
          </div>
        )}
      </section>

      {editorOpen && (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">{editingId ? "Edit blog post" : "Create blog post"}</h3>
              <p className="mt-1 text-xs text-slate-500">Posts without a publication date remain drafts.</p>
            </div>
            <button type="button" onClick={() => { setEditorOpen(false); setError(null); }} className="grid size-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100" aria-label="Close blog editor"><X size={17} /></button>
          </div>

          <form onSubmit={savePost} className="mt-5 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-xs font-medium text-slate-700 sm:col-span-2">Title
                <input required maxLength={200} value={values.title} onChange={(event) => setValues((current) => ({ ...current, title: event.target.value, slug: slugManuallyEdited ? current.slug : slugify(event.target.value) }))} className={inputClass} />
              </label>
              <label className="block text-xs font-medium text-slate-700">Slug
                <input required maxLength={180} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={values.slug} onChange={(event) => { setSlugManuallyEdited(true); setValues((current) => ({ ...current, slug: slugify(event.target.value) })); }} className={inputClass} />
              </label>
              <label className="block text-xs font-medium text-slate-700">Author
                <input required maxLength={120} value={values.author} onChange={(event) => setValues((current) => ({ ...current, author: event.target.value }))} className={inputClass} />
              </label>
              <label className="block text-xs font-medium text-slate-700">Publication date
                <input type="datetime-local" value={values.publishedAt} onChange={(event) => setValues((current) => ({ ...current, publishedAt: event.target.value }))} className={inputClass} />
              </label>
              <label className="block text-xs font-medium text-slate-700">Cover image URL
                <input type="url" maxLength={2048} value={values.coverImage} onChange={(event) => setValues((current) => ({ ...current, coverImage: event.target.value }))} className={inputClass} />
              </label>
              <label className="block text-xs font-medium text-slate-700 sm:col-span-2">Excerpt
                <textarea maxLength={500} rows={2} value={values.excerpt} onChange={(event) => setValues((current) => ({ ...current, excerpt: event.target.value }))} className={textareaClass} />
              </label>
              <label className="block text-xs font-medium text-slate-700 sm:col-span-2">Content
                <textarea required maxLength={200000} rows={14} value={values.content} onChange={(event) => setValues((current) => ({ ...current, content: event.target.value }))} className={`${textareaClass} min-h-64`} />
              </label>
              <label className="block text-xs font-medium text-slate-700">SEO title
                <input maxLength={200} value={values.seoTitle} onChange={(event) => setValues((current) => ({ ...current, seoTitle: event.target.value }))} className={inputClass} />
              </label>
              <label className="block text-xs font-medium text-slate-700">SEO keywords
                <input value={values.keywords} onChange={(event) => setValues((current) => ({ ...current, keywords: event.target.value }))} className={inputClass} placeholder="Separate with commas" />
              </label>
              <label className="block text-xs font-medium text-slate-700 sm:col-span-2">SEO description
                <textarea maxLength={500} rows={2} value={values.seoDescription} onChange={(event) => setValues((current) => ({ ...current, seoDescription: event.target.value }))} className={textareaClass} />
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => { setEditorOpen(false); setError(null); }} className="h-10 rounded-md border border-slate-200 px-4 text-xs font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button type="submit" disabled={saving} className="inline-flex h-10 items-center gap-2 rounded-md bg-blue-600 px-4 text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60">
                <Save size={15} /> {saving ? "Saving…" : "Save post"}
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}
