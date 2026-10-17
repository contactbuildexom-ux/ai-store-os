import type { Metadata } from "next";
import { DashboardBlogs } from "@/components/dashboard-blogs";

export const metadata: Metadata = { title: "Blogs" };

export default function DashboardBlogsPage() {
  return <DashboardBlogs />;
}
