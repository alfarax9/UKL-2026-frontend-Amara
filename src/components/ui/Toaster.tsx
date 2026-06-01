"use client";

import { Toaster as SonnerToaster } from "sonner";
import { CheckCircle, XCircle } from "lucide-react";

/**
 * Sonner-based Toaster positioned at top-right (ReUI "Top right" style)
 * with Amara's own color palette.
 *
 * Renders success toasts with primary (#284139) background
 * and error toasts with a red tone — all matching the Amara design system.
 */
export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "flex items-center gap-3 w-full max-w-[356px] rounded-xl px-4 py-3.5 text-sm font-medium shadow-[0px_8px_24px_rgba(40,65,57,0.25)] backdrop-blur-sm",
          success: "bg-white text-ink border border-line/40",
          error: "bg-white text-ink border border-red-200",
          title: "text-sm font-medium",
          description: "text-xs opacity-80 mt-0.5",
          actionButton:
            "ml-auto shrink-0 rounded-md bg-white/20 px-2.5 py-1 text-xs font-semibold text-white hover:bg-white/30 transition-colors",
          cancelButton:
            "ml-1 shrink-0 text-white/70 hover:text-white transition-colors",
        },
      }}
      icons={{
        success: <CheckCircle size={18} className="shrink-0 text-primary" />,
        error: <XCircle size={18} className="shrink-0 text-red-500" />,
      }}
      gap={8}
      duration={2600}
    />
  );
}
