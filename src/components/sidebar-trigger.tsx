"use client";

import { PanelLeft } from "lucide-react";
import { useSidebar } from "./sidebar-provider";

export function SidebarTrigger() {
  const { toggleSidebar } = useSidebar();

  return (
    <button
      onClick={toggleSidebar}
      className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      title="Toggle sidebar"
    >
      <PanelLeft className="h-4 w-4" />
    </button>
  );
}
