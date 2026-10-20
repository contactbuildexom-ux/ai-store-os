import type { Metadata } from "next";
import { AdminPricingPlans } from "@/components/admin-pricing-plans";
import { AdminPlanUpgradeApprovals } from "@/components/admin-plan-upgrades";

export const metadata: Metadata = { title: "Subscriptions & Approvals" };

export default function SubscriptionsPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-medium text-blue-700">Platform management</p>
        <h2 className="mt-1.5 text-[25px] font-semibold tracking-tight text-slate-900">Subscriptions & Payment Approvals</h2>
        <p className="mt-1 text-sm text-slate-500">Review and approve merchant plan upgrades, and maintain platform subscription pricing.</p>
      </div>

      {/* Pending Upgrade Approvals Section */}
      <AdminPlanUpgradeApprovals />

      {/* Pricing Plans Configuration */}
      <AdminPricingPlans />
    </div>
  );
}
