import Link from "next/link";

export default function FinalCta() {
  return (
    <section className="bg-white px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-br from-brand-blue via-brand-blue-dark to-brand-navy px-6 py-14 text-center shadow-xl shadow-brand-navy/20 sm:px-12 sm:py-16">
        {/* Soft decorative glows */}
        <div
          className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-20 -right-16 h-64 w-64 rounded-full bg-white/5 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to launch your store?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-blue-100 sm:text-lg">
            Join creators and small businesses selling online with Buildexom. It
            takes minutes.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-brand-blue-dark shadow-sm transition hover:bg-blue-50 sm:w-auto"
            >
              Start building free
            </Link>
            <Link
              href="/contact"
              className="inline-flex w-full items-center justify-center rounded-lg border border-white/60 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 sm:w-auto"
            >
              Talk to our team
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}