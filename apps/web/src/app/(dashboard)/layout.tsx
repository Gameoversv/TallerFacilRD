"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, getUser, clearToken } from "@/lib/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import ImpersonationBanner from "@/components/ImpersonationBanner";
import GlobalBanner from "@/components/layout/GlobalBanner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<ReturnType<typeof getUser>>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }
    const u = getUser();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(u);
  }, [router]);

  function handleLogout() {
    clearToken();
    router.push("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background print:block print:h-auto print:overflow-visible">
      <Sidebar user={user} onLogout={handleLogout} />

      <div className="flex min-w-0 flex-1 flex-col">
        <ImpersonationBanner />
        <Topbar />
        <main className="flex-1 overflow-y-auto print:overflow-visible">
          <GlobalBanner />
          <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8 print:max-w-none print:p-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
