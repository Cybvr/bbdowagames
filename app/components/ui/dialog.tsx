"use client";

import { useEffect, type ReactNode } from "react";

export function Dialog({ open, children }: { open: boolean; children: ReactNode }) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl border-2 border-b-[6px] border-[var(--color-border)] w-full max-w-lg shadow-2xl">
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ children }: { children: ReactNode }) {
  return <div className="px-6 pt-6 pb-2">{children}</div>;
}

export function DialogTitle({ children }: { children: ReactNode }) {
  return <h2 className="text-[22px] font-black text-[var(--color-text-main)] m-0">{children}</h2>;
}

export function DialogDescription({ children }: { children: ReactNode }) {
  return <p className="text-[14px] text-[var(--color-text-muted)] mt-1 mb-0">{children}</p>;
}

export function DialogBody({ children }: { children: ReactNode }) {
  return <div className="px-6 py-4 flex flex-col gap-4">{children}</div>;
}

export function DialogFooter({ children }: { children: ReactNode }) {
  return <div className="px-6 pb-6 flex gap-3 justify-end">{children}</div>;
}
