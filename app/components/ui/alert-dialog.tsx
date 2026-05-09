"use client";

import * as React from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./dialog";
import { Button } from "./button";

interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  cancelText?: string;
  actionText?: string;
  onAction: () => void;
  variant?: "default" | "destructive";
}

export function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  cancelText = "Cancel",
  actionText = "Continue",
  onAction,
  variant = "default",
}: AlertDialogProps) {
  return (
    <Dialog open={open}>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button 
          variant="outline" 
          onClick={() => onOpenChange(false)}
          className="font-black uppercase text-[12px] tracking-wider"
        >
          {cancelText}
        </Button>
        <Button
          variant={variant === "destructive" ? "destructive" : "game"}
          onClick={() => {
            onAction();
            onOpenChange(false);
          }}
          className="font-black uppercase text-[12px] tracking-wider"
        >
          {actionText}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
