import type { Metadata } from "next";
import { AdminPricingPlans } from "@/components/admin-pricing-plans";

export const metadata: Metadata = { title: "Subscriptions | Buildexom AI" };

export default function SubscriptionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium text-blue-700">Platform management</p>
        <h2 className="mt-1.5 text-[25px] font-semibold tracking-tight text-slate-900">Subscriptions & Pricing</h2>
        <p className="mt-1 text-sm text-slate-500">Create and maintain the plans available to storefronts.</p>
      </div>
      <AdminPricingPlans />
    </div>
  );
}
