"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Game, GameStatus } from "@/lib/data";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "./ui/select";

interface QuestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quest: Game | null;
  onSave: (quest: Omit<Game, "id"> & { id?: string }) => Promise<void>;
}

export function QuestModal({ open, onOpenChange, quest, onSave }: QuestModalProps) {
  const [formData, setFormData] = useState<Omit<Game, "id"> & { id?: string }>({
    week: 1,
    title: "",
    submitTitle: "",
    eyebrow: "",
    description: "",
    status: "pending",
    statusLabel: "Pending",
    meta: [],
    criteria: [],
    variant: "locked",
    timeLimit: 5,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (quest) {
      setFormData({ ...quest, timeLimit: quest.timeLimit ?? 5 });
    } else {
      setFormData({
        week: 1,
        title: "",
        submitTitle: "",
        eyebrow: "",
        description: "",
        status: "pending",
        statusLabel: "Pending",
        meta: [],
        criteria: [],
        variant: "locked",
        timeLimit: 20
      });
    }
  }, [quest, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSave(formData);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving quest:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open}>
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
        <DialogHeader>
          <DialogTitle>{quest ? "Edit Quest" : "New Quest"}</DialogTitle>
          <DialogDescription>
            {quest ? "Update the details of this quest." : "Create a new creative challenge."}
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black uppercase text-[var(--color-text-muted)]">Week</label>
              <Input type="number" value={formData.week} onChange={e => setFormData({ ...formData, week: parseInt(e.target.value) })} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black uppercase text-[var(--color-text-muted)]">Time limit (mins)</label>
              <Input type="number" min={1} max={60} value={formData.timeLimit ?? 5} onChange={e => setFormData({ ...formData, timeLimit: parseInt(e.target.value) || 5 })} required />
            </div>
            <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
              <label className="text-[11px] font-black uppercase text-[var(--color-text-muted)]">Status</label>
              <Select 
                value={formData.status} 
                onValueChange={value => {
                  const status = value as GameStatus;
                  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
                  setFormData({ ...formData, status, statusLabel });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-black uppercase text-[var(--color-text-muted)]">Title</label>
            <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-black uppercase text-[var(--color-text-muted)]">Submit Title (Short)</label>
            <Input value={formData.submitTitle} onChange={e => setFormData({ ...formData, submitTitle: e.target.value })} required />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-black uppercase text-[var(--color-text-muted)]">Eyebrow</label>
            <Input value={formData.eyebrow} onChange={e => setFormData({ ...formData, eyebrow: e.target.value })} required />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-black uppercase text-[var(--color-text-muted)]">Description</label>
            <Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required rows={4} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black uppercase text-[var(--color-text-muted)]">Meta (comma separated)</label>
              <Input
                value={formData.meta.join(", ")}
                onChange={e => setFormData({ ...formData, meta: e.target.value.split(",").map(s => s.trim()) })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black uppercase text-[var(--color-text-muted)]">Variant</label>
              <Select 
                value={formData.variant} 
                onValueChange={value => setFormData({ ...formData, variant: value as any })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select variant" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="locked">Locked</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-black uppercase text-[var(--color-text-muted)]">Criteria (Comma separated)</label>
            <Input 
              value={formData.criteria.join(", ")} 
              onChange={e => setFormData({ ...formData, criteria: e.target.value.split(",").map(s => s.trim()) })} 
              required
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" variant="game" disabled={isLoading}>{isLoading ? "Saving..." : "Save Quest"}</Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
