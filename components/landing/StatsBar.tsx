export default function StatsBar() {
  const stats = [
    { label: 'Stores Generated', val: '12,500+' },
    { label: 'Orders via WhatsApp', val: 'Rs. 45M+' },
    { label: 'Average Build Time', val: '28 Sec' },
    { label: 'Customer Satisfaction', val: '99.4%' }
  ];

  return (
    <div className="border-b border-slate-800 bg-slate-950 py-10 px-4">
      <div className="mx-auto max-w-7xl grid grid-cols-2 gap-6 text-center md:grid-cols-4">
        {stats.map((item, i) => (
          <div key={i}>
            <p className="text-3xl font-extrabold text-white sm:text-4xl font-mono">{item.val}</p>
            <p className="mt-1 text-xs text-slate-400 font-medium">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
