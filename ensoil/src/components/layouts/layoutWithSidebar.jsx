'use client';

import Sidebar from "@/components/sidebar";

export default function WithSidebarLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 ml-[21w] p-4 overflow-auto">
        {children}
      </main>
    </div>
  );
}