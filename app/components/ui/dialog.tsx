"use client";

import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Dialog({ open, children }: { open: boolean; children: ReactNode }) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl border-2 border-b-[6px] border-[var(--color-border)] w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("px-6 pt-6 pb-2 flex-shrink-0", className)}>{children}</div>;
}

export function DialogTitle({ children }: { children: ReactNode }) {
  return <h2 className="text-[22px] font-black text-[var(--color-text-main)] m-0 leading-tight">{children}</h2>;
}

export function DialogDescription({ children }: { children: ReactNode }) {
  return <p className="text-[14px] text-[var(--color-text-muted)] mt-1 mb-0 font-medium">{children}</p>;
}

export function DialogBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("px-6 py-4 flex-1 overflow-y-auto flex flex-col gap-4 min-h-0 scrollbar-thin", className)}>{children}</div>;
}

export function DialogFooter({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("px-6 pb-6 pt-2 flex gap-3 justify-end flex-shrink-0", className)}>{children}</div>;
}
