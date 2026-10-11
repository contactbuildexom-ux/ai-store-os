import { Check, X } from 'lucide-react';

export default function WhyChooseBuildexom() {
  const comparisons = [
    { feature: 'Store Creation Time', traditional: '2 to 4 Weeks', buildexom: '30 Seconds via AI Prompt' },
    { feature: 'Design & Theme Cost', traditional: 'Rs. 40,000 - 80,000', buildexom: 'Included Free with AI' },
    { feature: 'WhatsApp Ordering Integration', traditional: 'Complex plugins & extra monthly fee', buildexom: '1-Click Built-in WhatsApp Invoicing' },
    { feature: 'Catalog Curation', traditional: 'Manual data entry for days', buildexom: 'Instant AI Product & Copy Generator' },
    { feature: 'Subdomain Hosting', traditional: 'Manual DNS & server setup', buildexom: 'Instant Automatic Subdomain' }
  ];

  return (
    <section className="bg-slate-900 py-20 px-4 sm:px-6 border-t border-slate-800">
      <div className="mx-auto max-w-5xl">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Comparison</span>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Why Choose Buildexom AI Store Builder?
          </h2>
          <p className="mt-3 text-xs text-slate-400 sm:text-sm">
            Everything an e-commerce entrepreneur needs to launch without hiring developers or agencies.
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-900/80 font-bold text-slate-300">
              <tr>
                <th className="p-5">Feature</th>
                <th className="p-5 text-slate-400">Traditional Agency / Custom Dev</th>
                <th className="p-5 text-emerald-400 bg-emerald-950/20">Buildexom AI Store OS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {comparisons.map((c, i) => (
                <tr key={i} className="hover:bg-slate-900/40">
                  <td className="p-5 font-semibold text-white">{c.feature}</td>
                  <td className="p-5 text-slate-400">{c.traditional}</td>
                  <td className="p-5 font-bold text-emerald-300 bg-emerald-950/10 flex items-center gap-2">
                    <Check size={15} className="text-emerald-400 shrink-0" />
                    <span>{c.buildexom}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
