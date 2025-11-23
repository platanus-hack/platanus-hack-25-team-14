"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  FileText,
  Clock,
  Upload,
  Home,
  Menu,
  LogOut,
  User,
} from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useSession, signOut } from "../lib/auth-client";
import { LogoLoading } from "./FancyLoading";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  const navItems = [
    { path: "/", label: "Inicio", icon: Home },
    { path: "/documents", label: "Documentos", icon: FileText },
    { path: "/upload", label: "Subir archivo", icon: Upload },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname?.startsWith(path);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  if (isPending) {
    return <LogoLoading />;
  }

  if (!session) {
    return null;
  }

  const userInitials =
    session.user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-stone-50 transition-colors duration-500">
      <header className="bg-white border-b border-stone-200 shadow-md">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between relative">
          <div className="flex items-center">
            <Link href="/">
              <Image
                src="/meditrack-logo.png"
                alt="MediTrack"
                width={140}
                height={40}
                priority
                className="h-10 md:h-12 w-auto"
              />
            </Link>
          </div>

          <nav className="flex items-center gap-2 absolute left-1/2 transform -translate-x-1/2">
            <Link href="/" legacyBehavior passHref>
              <Button
                size="sm"
                className={`gap-1.5 md:gap-2 ${
                  isActive("/")
                    ? "bg-emerald-600 hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 text-white"
                    : "border-stone-300 text-slate-700 hover:bg-stone-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                } text-xs md:text-sm h-8 md:h-9 px-2.5 md:px-3.5 transition-all duration-300 hover:shadow-lg hover:scale-105`}
                variant={isActive("/") ? "default" : "outline"}
              >
                <Home className="w-3.5 md:w-4 h-3.5 md:h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
            </Link>
            <Link href="/documents" legacyBehavior passHref>
              <Button
                variant="outline"
                size="sm"
                className={`gap-1.5 md:gap-2 ${
                  isActive("/documents")
                    ? "bg-emerald-600 hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 text-white border-emerald-600"
                    : "border-stone-300 text-slate-700 hover:bg-stone-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                } text-xs md:text-sm h-8 md:h-9 px-2.5 md:px-3.5 transition-all duration-300`}
              >
                <FileText className="w-3.5 md:w-4 h-3.5 md:h-4" />
                <span className="hidden sm:inline">Documentos</span>
              </Button>
            </Link>
            <Link href="/upload" legacyBehavior passHref>
              <Button
                variant="outline"
                size="sm"
                className={`gap-1.5 md:gap-2 ${
                  isActive("/upload")
                    ? "bg-emerald-600 hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 text-white border-emerald-600"
                    : "border-stone-300 text-slate-700 hover:bg-stone-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                } text-xs md:text-sm h-8 md:h-9 px-2.5 md:px-3.5 transition-all duration-300 hidden md:flex`}
              >
                <Upload className="w-3.5 md:w-4 h-3.5 md:h-4" />
                <span className="hidden sm:inline">Subir</span>
              </Button>
            </Link>
          </nav>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="relative cursor-pointer focus:outline-none"
              >
                <Avatar className="w-8 md:w-9 h-8 md:h-9 bg-blue-600 ring-2 ring-blue-200 focus:ring-emerald-500 transition-transform duration-300 hover:scale-110">
                  <AvatarImage
                    src={session.user?.image || ""}
                    alt={session.user?.name || ""}
                  />
                  <AvatarFallback className="bg-blue-600 text-white text-xs md:text-sm">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {session.user?.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session.user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
