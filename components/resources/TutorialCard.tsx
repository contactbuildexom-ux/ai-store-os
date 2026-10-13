// components/resources/TutorialCard.tsx

import type { Tutorial, TutorialPlan } from "@/lib/tutorials";

const planStyles: Record<TutorialPlan, string> = {
  "All plans": "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  "Pro & Business": "bg-blue-50 text-blue-700 ring-blue-600/20",
  Business: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
};

export default function TutorialCard({ tutorial }: { tutorial: Tutorial }) {
  const { id, title, description, duration, plan, videoUrl } = tutorial;

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/60">
      {/* Top row: number + plan badge */}
      <div className="mb-5 flex items-center justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 text-sm font-bold text-white shadow-md shadow-blue-200">
          {String(id).padStart(2, "0")}
        </span>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${planStyles[plan]}`}
        >
          {plan}
        </span>
      </div>

      {/* Content */}
      <h3 className="text-lg font-bold leading-snug text-slate-900">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
        {description}
      </p>

      {/* Footer: duration + action */}
      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="flex items-center gap-1.5 text-sm text-slate-500">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle cx="12" cy="12" r="9" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 2" />
          </svg>
          {duration}
        </span>

        {videoUrl ? (
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.8A1 1 0 004.8 3.7v12.6a1 1 0 001.5.9l10.5-6.3a1 1 0 000-1.8L6.3 2.8z" />
            </svg>
            Watch
          </a>
        ) : (
          <span className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-500">
            Coming soon
          </span>
        )}
      </div>
    </article>
  );
}