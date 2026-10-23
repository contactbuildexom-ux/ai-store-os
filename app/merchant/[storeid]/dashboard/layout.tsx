import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { canAccessStore } from "@/lib/merchant-api-auth";
import { storeRepo } from "@/lib/store-repository";

type DashboardLayoutProps = {
  children: ReactNode;
  params: Promise<{ storeid: string }>;
};

export default async function MerchantDashboardLayout({ children, params }: DashboardLayoutProps) {
  const { storeid } = await params;
  const store = await storeRepo.getStore(storeid);

  if (!store) notFound();
  if (!(await canAccessStore(store.id))) redirect("/login");

  return children;
}
