"use client";

import { cn } from "@/lib/utils";
import type { Game } from "@/lib/data";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";

interface QuestComponentProps {
  game: Game;
  onStart: (id: string) => void;
  variant?: "hero" | "card";
  submitted?: boolean;
}

export default function QuestComponent({ game, onStart, variant = "card", submitted = false }: QuestComponentProps) {
  const isHero = variant === "hero";

  if (isHero) {
    return (
      <Card 
        className="bg-white border-[3px] border-[#1cb0f6] border-b-[8px] border-b-[#1cb0f6] rounded-[30px] p-5 md:p-8 w-full md:max-h-[calc(100vh-140px)] flex flex-col"
        onClick={() => onStart(game.id)}
      >
        <CardContent className="p-0 flex flex-col items-center gap-3 md:gap-4 h-full">
          <div className="w-12 h-12 md:w-14 md:h-14 bg-[#1cb0f6] border-b-4 border-[#1487c1] rounded-2xl flex items-center justify-center text-white text-[20px] md:text-[24px] font-black shadow-inner flex-shrink-0">
            {game.week}
          </div>

          <div className="flex flex-col items-center gap-2 max-w-2xl text-center flex-1 min-h-0">
            <h2 className="text-[22px] md:text-[32px] font-black tracking-tight text-[#4b4b4b] m-0 leading-tight">
              {game.title.replace(`Week ${game.week} - `, "")}
            </h2>
            
            <div className="overflow-y-auto px-1 md:px-2">
              <p className="text-[#777777] text-[15px] md:text-[18px] leading-relaxed font-medium">
                {game.description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 md:gap-6 mt-2 text-[#afafaf] font-bold text-[12px] md:text-sm flex-shrink-0">
            {game.meta.map((m, i) => {
              const displayValue = (i === 1 && game.timeLimit) ? `${game.timeLimit} mins` : m;
              return (
                <span key={i} className="flex items-center gap-1.5 md:gap-2">
                  <span className="text-base md:text-lg">{i === 0 ? "📅" : i === 1 ? "🪙" : "👥"}</span>
                  {displayValue}
                </span>
              );
            })}
          </div>

          <div className="w-full flex justify-center md:justify-end mt-2 flex-shrink-0">
            <Button
              variant="game"
              className="w-full md:w-auto bg-[#58cc02] border-b-[6px] border-[#46a302] hover:bg-[#58cc02] hover:opacity-90 rounded-[14px] px-8 md:px-10 py-4 md:py-5 text-white font-black text-base md:text-lg uppercase transition-all active:border-b-0 active:translate-y-[6px]"
              onClick={() => onStart(game.id)}
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
      onClick={() => !submitted && game.variant !== "locked" && onStart(game.id)}
    >
      <CardContent className="p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 md:gap-4 flex-1 w-full">
          <div className={cn(
            "w-[44px] h-[44px] md:w-[48px] md:h-[48px] rounded-[12px] flex items-center justify-center text-[16px] md:text-[18px] font-black bg-[#f0f0f0] border-2 border-[var(--color-border)] border-b-4 text-[#afafaf] flex-shrink-0",
            game.variant === "active" && "bg-[var(--color-blue)] border-[var(--color-blue-dark)] text-white",
            game.variant === "completed" && "bg-[var(--color-green)] border-[var(--color-green-dark)] text-white",
          )}>
            {game.variant === "locked" ? "🔒" : game.week}
          </div>

          <div className="flex flex-col min-w-0">
            <h2 className="text-[18px] md:text-[20px] font-black leading-tight tracking-tight text-[var(--color-text-main)] m-0 truncate">
              {game.title.replace(`Week ${game.week} - `, "")}
            </h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
              {game.meta.map((m, i) => {
                const displayValue = (i === 1 && game.timeLimit) ? `${game.timeLimit} mins` : m;
                return (
                  <span key={i} className="flex items-center gap-1.5 text-[11px] md:text-[12px] font-bold text-[var(--color-text-muted)]">
                    <span className="text-sm">{i === 0 ? "📅" : i === 1 ? "🪙" : "👥"}</span>
                    {displayValue}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        <div className="w-full sm:w-auto flex justify-end">
          {game.status === "open" && (
            submitted ? (
              <Badge variant="game" className="bg-[var(--color-green)] w-full sm:w-auto justify-center">Submitted</Badge>
            ) : (
              <Button
                variant="game"
                size="sm"
                className="w-full sm:w-auto px-6 h-10 text-[13px]"
                onClick={() => onStart(game.id)}
              >
                Start Quest
              </Button>
            )
          )}

          {game.variant === "completed" && !submitted && (
            <Badge variant="game" className="bg-[var(--color-green)] w-full sm:w-auto justify-center">Done</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
