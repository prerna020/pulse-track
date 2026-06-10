import { redirect } from "next/navigation";

import { Sidebar } from "@/components/dashboard/sidebar";
import { getSession } from "@/lib/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar user={session.user} />
      <main className="flex-1 bg-[#f9fafb] p-8">{children}</main>
    </div>
  );
}
