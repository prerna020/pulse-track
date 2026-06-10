import { redirect } from "next/navigation";

import { Sidebar } from "@/components/dashboard/sidebar";
import { prisma } from "@/lib/prisma";
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

  const alertCount = await prisma.change.count({
    where: {
      isRead: false,
      snapshot: {
        trackedPage: {
          competitor: { userId: session.user.id },
        },
      },
    },
  });

  return (
    <div className="flex min-h-screen">
      <Sidebar user={session.user} alertCount={alertCount} />
      <main className="flex-1 bg-[#f5f0e8] p-8">{children}</main>
    </div>
  );
}
