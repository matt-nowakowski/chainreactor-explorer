"use client";

import { createContext, useContext, useState, useEffect } from "react";

type SidebarContextType = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggleSidebar: () => void;
};

const SidebarContext = createContext<SidebarContextType>({
  open: true,
  setOpen: () => {},
  toggleSidebar: () => {},
});

export function useSidebar() {
  return useContext(SidebarContext);
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("sidebar-open");
    if (stored !== null) setOpen(stored === "true");
  }, []);

  function toggleSidebar() {
    setOpen((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar-open", String(next));
      return next;
    });
  }

  function handleSetOpen(value: boolean) {
    setOpen(value);
    localStorage.setItem("sidebar-open", String(value));
  }

  return (
    <SidebarContext.Provider value={{ open, setOpen: handleSetOpen, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}
