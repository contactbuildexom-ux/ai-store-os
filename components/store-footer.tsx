import { Landmark, Smartphone } from 'lucide-react';

type StorePaymentDetails = {
  bank_name: string;
  account_title: string;
  account_number: string;
  iban: string;
  jazzcash_number: string;
  jazzcash_title: string;
  easypaisa_number: string;
  easypaisa_title: string;
};

export function StoreFooter({ storeName, paymentDetails }: { storeName: string; paymentDetails: StorePaymentDetails }) {
  const accounts = [
    {
      name: 'Bank transfer',
      icon: Landmark,
      accent: 'bg-blue-50 text-blue-700',
      values: [
        ['Bank', paymentDetails.bank_name],
        ['Account title', paymentDetails.account_title],
        ['Account number', paymentDetails.account_number],
        ['IBAN', paymentDetails.iban],
      ] as const,
    },
    {
      name: 'JazzCash',
      icon: Smartphone,
      accent: 'bg-rose-50 text-rose-700',
      values: [['Account title', paymentDetails.jazzcash_title], ['Mobile number', paymentDetails.jazzcash_number]] as const,
    },
    {
      name: 'EasyPaisa',
      icon: Smartphone,
      accent: 'bg-emerald-50 text-emerald-700',
      values: [['Account title', paymentDetails.easypaisa_title], ['Mobile number', paymentDetails.easypaisa_number]] as const,
    },
  ].map((account) => ({ ...account, values: account.values.filter(([, value]) => value.trim()) }));
  const availableAccounts = accounts.filter((account) => account.values.length > 0);

  return (
    <footer className="border-t border-slate-200 bg-white px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-7xl">
        {availableAccounts.length > 0 && (
          <section aria-labelledby="store-payment-details" className="mx-auto max-w-5xl">
            <div className="text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Secure your advance payment</p>
              <h2 id="store-payment-details" className="mt-2 text-lg font-semibold tracking-tight text-slate-900">Transfer directly to {storeName}</h2>
              <p className="mt-1 text-xs text-slate-500">Use the account details below for advance-payment orders.</p>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {availableAccounts.map(({ name, icon: Icon, accent, values }) => (
                <article key={name} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                    <span className={`grid size-9 place-items-center rounded-lg ${accent}`}><Icon size={17} /></span>
                    <h3 className="text-xs font-semibold text-slate-900">{name}</h3>
                  </div>
                  <dl className="mt-3 space-y-2.5">
                    {values.map(([label, value]) => (
                      <div key={label} className="min-w-0">
                        <dt className="text-[9px] font-medium uppercase tracking-wider text-slate-400">{label}</dt>
                        <dd className="mt-0.5 break-all text-xs font-semibold text-slate-700">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </article>
              ))}
            </div>
          </section>
        )}
        <p className={`${availableAccounts.length ? 'mt-8 border-t border-slate-100 pt-5' : ''} text-center text-[10px] text-slate-500`}>
          Secure order request · {storeName}
        </p>
      </div>
    </footer>
  );
}