"use client";

import { useRouter, useSearchParams } from "next/navigation";
import AppHeader from "@/app/components/AppHeader";
import { useEffect, useState, useRef, Suspense } from "react";
import { getStoredUser, type SessionUser } from "@/lib/session";
import { type StoredSubmission } from "@/lib/submissions";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter } from "@/app/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Copy, ImagePlus, Send } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where, getDocs } from "firebase/firestore";
import { Game } from "@/lib/data";
import { submitQuestResponse } from "@/lib/firestore-service";
import LoginModal from "@/app/components/LoginModal";

type Message = {
  role: "assistant" | "user";
  content: string | React.ReactNode;
  id: string;
};

function SubmitContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const introSent = useRef(false);
  
  const submitTitle = searchParams.get("title") || "New Task";
  const [games, setGames] = useState<Game[]>([]);
  const game = games.find(g => g.submitTitle === submitTitle || g.title.includes(submitTitle));

  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [phase, setPhase] = useState<"intro" | "brief" | "chat" | "done">("intro");
  const [isTyping, setIsTyping] = useState(false);
  const [tokensUsed, setTokensUsed] = useState(0);
  const tokenBudget = 1000;
  const tokenPct = Math.min(100, Math.round((tokensUsed / tokenBudget) * 100));
  const TIMER_SECONDS = 5 * 60;
  const [secondsLeft, setSecondsLeft] = useState(TIMER_SECONDS);
  const timerMins = Math.floor(secondsLeft / 60);
  const timerSecs = secondsLeft % 60;
  const timerWarning = secondsLeft <= 60;

  const [submitOpen, setSubmitOpen] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [copied, setCopied] = useState(false);
  const [submitText, setSubmitText] = useState("");
  const [submitImage, setSubmitImage] = useState<string | null>(null);
  const [thanksOpen, setThanksOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const chatResponses = [
    `Interesting angle. What feels most urgent to you — what the brand says, how it looks, or who it says it to first?`,
    `Push that further. If KudiPay does nothing for the first hour, what happens? Now flip it — what's the boldest move they could make?`,
    `Strong instinct. What would make this feel unmistakably KudiPay and not just a generic crisis response?`,
    `Good. Now think about the person seeing this for the first time — someone who's never heard of KudiPay. Does your response still land?`,
    `That's worth developing. What's the one thing KudiPay needs people to feel after this — and does your idea deliver that?`,
    `You're thinking about it the right way. What would you cut if you had to make this twice as sharp?`,
    `Solid. Play devil's advocate — what's the worst way this response could be read, and how do you guard against that?`,
    `Nice. What does success look like 24 hours from now if this works?`,
  ];

  let responseIndex = 0;

  function estimateTokens(text: string) {
    return Math.ceil(text.length / 3.5);
  }

  function addAssistantMessage(content: string, tokenCost = 0) {
    setIsTyping(true);
    const delay = Math.min(2000, 600 + content.length * 8);
    setTimeout(() => {
      setMessages(prev => [...prev, { role: "assistant", content, id: Math.random().toString() }]);
      setIsTyping(false);
      if (tokenCost > 0) setTokensUsed(prev => Math.min(tokenBudget, prev + tokenCost));
    }, delay);
  }

  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    // Fetch quests from Firestore
    const unsubscribeQuests = onSnapshot(collection(db, "quests"), (snapshot) => {
      const qsts: Game[] = [];
      snapshot.forEach((doc) => {
        qsts.push({ id: doc.id, ...doc.data() } as Game);
      });
      setGames(qsts);
    });

    return () => unsubscribeQuests();
  }, []);

  useEffect(() => {
    const user = getStoredUser();
    setCurrentUser(user);

    if (!user) {
      // Don't redirect, we will show a login prompt in the UI
      return;
    }

    const checkSubmitted = async () => {
      if (game) {
        const q = query(
          collection(db, "submissions"),
          where("email", "==", user.email),
          where("questId", "==", game.id)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          router.replace("/dashboard");
        }
      }
    };

    checkSubmitted();

    if (game && !introSent.current) {
      introSent.current = true;
      addAssistantMessage(`Hi ${user.name}! I'm your creative thinking partner for this week's challenge. Ready to dive in?`);
    }
  }, [router, game]);

  useEffect(() => {
    if (phase === "intro" || phase === "done") return;
    if (secondsLeft <= 0) { setTimedOut(true); setSubmitOpen(true); return; }
    const t = setTimeout(() => setSecondsLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, secondsLeft]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  function handleSend(manualInput?: string) {
    const inputVal = (manualInput || currentInput).trim();
    if (!inputVal || phase === "done") return;

    const userTokens = estimateTokens(inputVal);
    setMessages(prev => [...prev, { role: "user", content: inputVal, id: Math.random().toString() }]);
    setCurrentInput("");
    setTokensUsed(prev => Math.min(tokenBudget, prev + userTokens));

    if (phase === "intro") {
      setPhase("brief");
      const briefText = `Here's the brief:\n\n"${game?.description}"\n\nYou're being scored on: ${game?.criteria.join(", ")}.\n\nAsk me anything — poke at the brief, test your angles, challenge your assumptions. I'm here to help you think it through. What's your first question?`;
      addAssistantMessage(briefText, estimateTokens(briefText));
    } else if (phase === "brief" || phase === "chat") {
      setPhase("chat");
      if (tokensUsed + userTokens >= tokenBudget) {
        addAssistantMessage("You've hit your token budget. Time to submit what you've got.");
        setPhase("done");
        return;
      }
      const response = chatResponses[responseIndex % chatResponses.length];
      responseIndex++;
      addAssistantMessage(response, estimateTokens(response) + userTokens);
    }
  }

  async function handleSubmit() {
    if (currentUser && game) {
      try {
        await submitQuestResponse({
          name: currentUser.name,
          email: currentUser.email,
          questId: game.id,
          questTitle: game.title,
          response: submitText,
          imageUrl: submitImage,
          tokensUsed,
        });
        setSubmitOpen(false);
        setPhase("done");
        setThanksOpen(true);
      } catch (error: any) {
        console.error("Error submitting response:", error);
        if (error?.message?.includes("exceeds the maximum allowed size")) {
          alert("Your submission (including the image) is too large. Please try a smaller image or less text.");
        } else if (error?.code === "permission-denied") {
          alert("Permission denied. Please try logging out and back in.");
        } else {
          alert(`Failed to submit: ${error?.message || "Unknown error"}. Please try again.`);
        }
      }
    }
  }

  function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const max = 800; // Limit to 800px max dimension
        if (width > height) {
          if (width > max) { height *= max / width; width = max; }
        } else {
          if (height > max) { width *= max / height; height = max; }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        setSubmitImage(canvas.toDataURL('image/jpeg', 0.7)); // Compress to 70% quality jpeg
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  if (!currentUser) {
    return (
      <div className="flex flex-col flex-1">
        <AppHeader onLoginClick={() => setShowLoginModal(true)} />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <Card className="p-8 max-w-sm border-b-[8px]">
            <div className="text-4xl mb-4">🔒</div>
            <h2 className="text-[22px] font-black text-[var(--color-text-main)] mb-2">Ready to take the challenge?</h2>
            <p className="text-[var(--color-text-muted)] text-[15px] mb-6">You need to be logged in to participate in quests and chat with the AI assistant.</p>
            <Button variant="game" size="xl" onClick={() => setShowLoginModal(true)} className="w-full">Sign In to Start</Button>
          </Card>
        </div>
        <LoginModal 
          isOpen={showLoginModal} 
          onClose={() => setShowLoginModal(false)} 
          onSuccess={() => {
            const user = getStoredUser();
            setCurrentUser(user);
          }}
        />
      </div>
    );
  }

  if (!game) return null;

  return (
    <>
    <div className="flex flex-col flex-1 h-screen bg-[#f8fcff]">
      <AppHeader
        isAdmin={currentUser.isAdmin}
        onLoginClick={() => setShowLoginModal(true)}
        slot={phase !== "intro" && phase !== "done" ? (
          <span className={`text-[13px] font-black px-3 py-1 rounded-full border-2 border-b-4 ${timerWarning ? "bg-red-500 border-red-700 text-white" : "bg-white border-[var(--color-border)] text-[var(--color-text-muted)]"}`}>
            {timerMins}:{String(timerSecs).padStart(2, "0")}
          </span>
        ) : undefined}
      />

      <div className="flex-1 max-w-3xl mx-auto w-full flex flex-col overflow-hidden pb-6">
        {/* Chat Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
        >
          {messages.map((msg) => (
            <div 
              key={msg.id}
              className={cn(
                "flex w-full animate-in fade-in slide-in-from-bottom-2",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div className={cn(
                "max-w-[85%] p-4 rounded-2xl text-[15px] font-medium leading-relaxed shadow-sm",
                msg.role === "user" 
                  ? "bg-[var(--color-blue)] text-white rounded-tr-none border-b-4 border-[var(--color-blue-dark)]" 
                  : "bg-white text-[var(--color-text-main)] rounded-tl-none border-2 border-[var(--color-border)] border-b-4"
              )}>
                {msg.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start animate-pulse">
              <div className="bg-white p-4 py-3 rounded-2xl rounded-tl-none border-2 border-[var(--color-border)] flex gap-1">
                <div className="w-1.5 h-1.5 bg-[var(--color-text-muted)] rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-[var(--color-text-muted)] rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-[var(--color-text-muted)] rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          {/* Quick reply on intro */}
          {!isTyping && phase === "intro" && (
            <div className="flex gap-2">
              <Button variant="game" size="sm" onClick={() => handleSend("Ready to dive in!")}>
                Ready to dive in!
              </Button>
            </div>
          )}

          {/* Copy + submit after last bot message */}
          {!isTyping && phase === "chat" && (() => {
            const lastBot = [...messages].reverse().find(m => m.role === "assistant");
            if (!lastBot) return null;
            return (
              <div className="flex flex-col gap-2 pl-1">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(typeof lastBot.content === "string" ? lastBot.content : "");
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="flex items-center gap-1.5 text-[12px] font-black text-[var(--color-text-muted)] hover:text-[var(--color-blue)] transition-colors self-start"
                >
                  <Copy size={13} />{copied ? "Copied!" : "Copy response"}
                </button>
                <Button variant="game" size="sm" className="self-start" onClick={() => setSubmitOpen(true)}>
                  I have what I need, ready to submit
                </Button>
              </div>
            );
          })()}
        </div>


        {/* Input area */}
        {phase !== "done" && (
          <div className="px-6 pb-4 flex-shrink-0 flex flex-col gap-2">
            <Card className="p-2 border-2 border-b-4 border-[var(--color-border)] rounded-2xl flex items-end gap-2 bg-white shadow-lg">
              <Textarea
                className="flex-1 border-none focus:ring-0 min-h-[50px] max-h-[150px] resize-none py-3 text-[15px]"
                placeholder={phase === "intro" ? "Or type your response..." : "Ask a question, push an angle, test an idea..."}
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
                }}
              />
              <Button variant="game" size="icon" className="h-10 w-10 rounded-xl mb-1" onClick={() => handleSend()} disabled={isTyping}>
                <Send size={18} />
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>

    {/* Submit dialog */}

    <Dialog open={submitOpen}>
      <DialogHeader>
        <DialogTitle>{timedOut ? "Time's up!" : "Submit your work"}</DialogTitle>
        <DialogDescription>{timedOut ? "Your time is done — submit what you've got." : "Write up your response to the brief. Add an image if it helps."}</DialogDescription>
      </DialogHeader>
      <DialogBody>
        <Textarea
          placeholder="What's your response to the brief?"
          rows={5}
          value={submitText}
          onChange={e => setSubmitText(e.target.value)}
        />
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
        {submitImage ? (
          <div className="relative">
            <img src={submitImage} alt="Attached" className="w-full rounded-xl border-2 border-[var(--color-border)] max-h-48 object-cover" />
            <button onClick={() => setSubmitImage(null)} className="absolute top-2 right-2 bg-white rounded-full w-6 h-6 text-xs font-black border border-[var(--color-border)]">×</button>
          </div>
        ) : (
          <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 text-[13px] font-black text-[var(--color-text-muted)] hover:text-[var(--color-blue)] transition-colors">
            <ImagePlus size={16} /> Add image
          </button>
        )}
      </DialogBody>
      <DialogFooter>
        <Button variant="outline" onClick={() => setSubmitOpen(false)}>Cancel</Button>
        <Button variant="game" onClick={handleSubmit} disabled={!submitText.trim()}>Submit</Button>
      </DialogFooter>
    </Dialog>

    {/* Thank you dialog */}
    <Dialog open={thanksOpen}>
      <DialogHeader>
        <DialogTitle>Work submitted</DialogTitle>
        <DialogDescription>Nice work. Your response is in — judges will review and score it shortly.</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="game" onClick={() => { setThanksOpen(false); router.push("/dashboard"); }}>Back to dashboard</Button>
      </DialogFooter>
    </Dialog>
    </>
  );
}

export default function SubmitPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center font-black text-[var(--color-blue)]">LOADING TASK...</div>}>
      <SubmitContent />
    </Suspense>
  );
}
