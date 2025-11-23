"use client";

import { usePathname } from "next/navigation";
import { DashboardLayout } from "./DashboardLayout";

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const isLoginPage = pathname === "/login";
  const isSharePage = pathname?.startsWith("/share");

  if (isLoginPage || isSharePage) {
    return <>{children}</>;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}

