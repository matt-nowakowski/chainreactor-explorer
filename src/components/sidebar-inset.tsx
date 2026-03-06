"use client";

import { useSidebar } from "./sidebar-provider";
import { SidebarTrigger } from "./sidebar-trigger";

export function SidebarInset({ children }: { children: React.ReactNode }) {
  const { open } = useSidebar();

  return (
    <main
      className="relative flex w-full flex-1 flex-col pt-[104px] lg:pt-0 transition-[padding] duration-200 ease-linear"
      style={{ paddingLeft: open ? 200 : 0 }}
    >
      <div
        className="flex-1 lg:m-2 lg:rounded-xl lg:shadow-sm bg-background min-h-screen lg:min-h-[calc(100vh-16px)] transition-[margin] duration-200 ease-linear"
        style={{ marginLeft: open ? 0 : 8 }}
      >
        <div className="hidden lg:flex items-center gap-2 px-4 pt-3">
          <SidebarTrigger />
        </div>
        <div className="w-full px-6 py-5">
          {children}
        </div>
      </div>
    </main>
  );
}
