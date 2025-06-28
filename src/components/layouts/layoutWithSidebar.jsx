'use client';

import { RestrictionAuth } from "../Authentication/RestrictionAuth";
import Sidebar from "../utils/sidebar";

export default function WithSidebarLayout({ children }) {
  return (
    <div className="flex min-h-screen dark:bg-secondary">
      <RestrictionAuth>
      <Sidebar />
        <main className="flex-1 ml-[21w] overflow-auto">
          {children}
        </main>
      </RestrictionAuth>
    </div>
  );
}