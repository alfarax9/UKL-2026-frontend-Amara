"use client";

import { createContext, useCallback, useContext, useState } from "react";

interface SidebarState {
  open: boolean;
  toggle: () => void;
  close: () => void;
}

const SidebarCtx = createContext<SidebarState>({
  open: false,
  toggle: () => {},
  close: () => {},
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((v) => !v), []);
  const close = useCallback(() => setOpen(false), []);

  return (
    <SidebarCtx.Provider value={{ open, toggle, close }}>
      {children}
    </SidebarCtx.Provider>
  );
}

export const useSidebar = () => useContext(SidebarCtx);
