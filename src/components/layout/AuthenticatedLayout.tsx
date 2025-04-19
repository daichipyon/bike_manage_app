"use client";

import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import Header from "./Header";
import SideNav from "./SideNav";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Prevent flash of unauthenticated content
  if (!isMounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    // This check is just for client-side fallback
    // The main protection happens in the authenticated layout.tsx
    typeof window !== "undefined" && (window.location.href = "/login");
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <SideNav />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}