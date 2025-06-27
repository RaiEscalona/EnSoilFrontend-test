'use client';

import Sidebar from "@/components/sidebar";
import { RestrictionAuth } from "../Authentication/RestrictionAuth";

export default function WithSidebarLayout({ children }) {
  return (
    <div className="flex min-h-screen dark:bg-secondary">
      <RestrictionAuth>
      <Sidebar />
      <main className="flex-1 ml-[21w] p-4 overflow-auto">
        {children}
      </main>
      </RestrictionAuth>
    </div>
  );
}