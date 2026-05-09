"use client";

import { cn } from "@/lib/utils";
import type { Game } from "@/lib/data";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";

interface QuestComponentProps {
  game: Game;
  onStart: (title: string) => void;
  variant?: "hero" | "card";
  submitted?: boolean;
}

export default function QuestComponent({ game, onStart, variant = "card", submitted = false }: QuestComponentProps) {
  const isHero = variant === "hero";

  if (isHero) {
    return (
      <Card 
        className="bg-white border-[3px] border-[#1cb0f6] border-b-[8px] border-b-[#1cb0f6] rounded-[30px] p-6 md:p-8 w-full max-h-[calc(100vh-140px)] flex flex-col"
        onClick={() => onStart(game.submitTitle)}
      >
        <CardContent className="p-0 flex flex-col items-center gap-4 h-full">
          {/* Top centered icon - smaller */}
          <div className="w-14 h-14 bg-[#1cb0f6] border-b-4 border-[#1487c1] rounded-2xl flex items-center justify-center text-white text-[24px] font-black shadow-inner flex-shrink-0">
            {game.week}
          </div>

          <div className="flex flex-col items-center gap-2 max-w-2xl text-center flex-1 min-h-0">
            <h2 className="text-[28px] md:text-[32px] font-black tracking-tight text-[#4b4b4b] m-0 leading-tight">
              {game.title.replace(`Week ${game.week} - `, "")}
            </h2>
            
            <div className="overflow-y-auto px-2">
              <p className="text-[#777777] text-[16px] md:text-[18px] leading-relaxed font-medium">
                {game.description}
              </p>
            </div>
          </div>

          {/* Meta list - horizontal to save height */}
          <div className="flex flex-wrap justify-center gap-6 mt-2 text-[#afafaf] font-bold text-sm flex-shrink-0">
            {game.meta.map((m, i) => (
              <span key={i} className="flex items-center gap-2">
                <span className="text-lg">{i === 0 ? "📅" : i === 1 ? "🪙" : "👥"}</span>
                {m}
              </span>
            ))}
          </div>

          {/* Action button bottom right */}
          <div className="w-full flex justify-end mt-2 flex-shrink-0">
            <Button
              variant="game"
              className="bg-[#58cc02] border-b-[6px] border-[#46a302] hover:bg-[#58cc02] hover:opacity-90 rounded-[14px] px-10 py-5 text-white font-black text-lg uppercase transition-all active:border-b-0 active:translate-y-[6px]"
              onClick={() => onStart(game.submitTitle)}
            >
              Start
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={cn(
        "transition-all duration-200 ease-in-out",
        !submitted && game.variant !== "locked" && "cursor-pointer hover:scale-[1.01] active:scale-[0.99]",
        game.variant === "active" && "border-[var(--color-blue)] border-b-[var(--color-blue-dark)]",
        game.variant === "completed" && "border-[var(--color-green)] border-b-[var(--color-green-dark)]",
        game.variant === "locked" && "opacity-60 cursor-default",
        submitted && "cursor-default"
      )}
      onClick={() => !submitted && game.variant !== "locked" && onStart(game.submitTitle)}
    >
      <CardContent className="p-4 px-6 flex items-center justify-between gap-4">
        {/* Left: Round & Info */}
        <div className="flex items-center gap-4 flex-1">
          <div className={cn(
            "w-[48px] h-[48px] rounded-[12px] flex items-center justify-center text-[18px] font-black bg-[#f0f0f0] border-2 border-[var(--color-border)] border-b-4 text-[#afafaf] flex-shrink-0",
            game.variant === "active" && "bg-[var(--color-blue)] border-[var(--color-blue-dark)] text-white",
            game.variant === "completed" && "bg-[var(--color-green)] border-[var(--color-green-dark)] text-white",
          )}>
            {game.variant === "locked" ? "🔒" : game.week}
          </div>

          <div className="flex flex-col">
            <h2 className="text-[20px] font-black leading-tight tracking-tight text-[var(--color-text-main)] m-0">
              {game.title.replace(`Week ${game.week} - `, "")}
            </h2>
            <div className="flex gap-4 mt-1">
              {game.meta.map((m, i) => (
                <span key={i} className="flex items-center gap-1.5 text-[12px] font-bold text-[var(--color-text-muted)]">
                  <span className="text-sm">{i === 0 ? "📅" : i === 1 ? "🪙" : "👥"}</span>
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Action */}
        {game.status === "open" && (
          submitted ? (
            <Badge variant="game" className="bg-[var(--color-green)]">Submitted</Badge>
          ) : (
            <Button
              variant="game"
              size="sm"
              className="px-6 h-10 text-[13px]"
              onClick={() => onStart(game.submitTitle)}
            >
              Start Quest
            </Button>
          )
        )}

        {game.variant === "completed" && !submitted && (
          <Badge variant="game" className="bg-[var(--color-green)]">Done</Badge>
        )}
      </CardContent>
    </Card>
  );
}
