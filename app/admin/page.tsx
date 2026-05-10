"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import AppHeader from "@/app/components/AppHeader";
import { useEffect, useState } from "react";
import { getStoredUser, type SessionUser } from "@/lib/session";
import { type StoredSubmission } from "@/lib/submissions";
import { type AppUser, type UserRole } from "@/lib/users";
import { saveQuest, deleteQuest, updateUserRole, createUserProfile } from "@/lib/firestore-service";
import { doc, deleteDoc } from "firebase/firestore";
import { QuestModal } from "@/app/components/QuestModal";
import { Input } from "@/app/components/ui/input";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/app/components/ui/select";
import { Game } from "@/lib/data";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AlertDialog } from "@/app/components/ui/alert-dialog";
import { Skeleton } from "@/app/components/ui/skeleton";

export default function AdminPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [submissions, setSubmissions] = useState<StoredSubmission[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserRole, setNewUserRole] = useState<UserRole>("player");
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [activeTab, setActiveTab] = useState<"submissions" | "library" | "users">("submissions");
  const [loading, setLoading] = useState(true);
  const [alertConfig, setAlertConfig] = useState<{
    open: boolean;
    title: string;
    description: string;
    actionText: string;
    onAction: () => void;
    variant: "default" | "destructive";
  }>({
    open: false,
    title: "",
    description: "",
    actionText: "",
    onAction: () => {},
    variant: "default"
  });
  const [questModalOpen, setQuestModalOpen] = useState(false);
  const [editingQuest, setEditingQuest] = useState<Game | null>(null);

  const openGames = games.filter((game) => game.status === "open");

  useEffect(() => {
    let loadedCount = 0;
    const markLoaded = () => { loadedCount++; if (loadedCount >= 3) setLoading(false); };

    // Real-time listener for submissions
    const q = query(collection(db, "submissions"), orderBy("submittedAt", "desc"));
    const unsubscribeSub = onSnapshot(q, (snapshot) => {
      const subs: StoredSubmission[] = [];
      snapshot.forEach((doc) => {
        subs.push({ id: doc.id, ...doc.data() } as StoredSubmission);
      });
      setSubmissions(subs);
      markLoaded();
    });

    // Real-time listener for quests
    const unsubscribeQuests = onSnapshot(collection(db, "quests"), (snapshot) => {
      const qsts: Game[] = [];
      snapshot.forEach((doc) => {
        qsts.push({ id: doc.id, ...doc.data() } as Game);
      });
      setGames(qsts.sort((a, b) => b.week - a.week));
      markLoaded();
    });

    // Real-time listener for users
    const unsubscribeUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const usrs: AppUser[] = [];
      snapshot.forEach((doc) => {
        usrs.push(doc.data() as AppUser);
      });
      setUsers(usrs.sort((a, b) => a.name.localeCompare(b.name)));
      markLoaded();
    });

    return () => {
      unsubscribeSub();
      unsubscribeQuests();
      unsubscribeUsers();
    };
  }, []);

  useEffect(() => {
    const storedUser = getStoredUser();

    if (!storedUser) {
      router.replace("/dashboard");
      return;
    }

    if (!storedUser.isAdmin) {
      router.replace("/dashboard");
      return;
    }

    setCurrentUser(storedUser);
  }, [router]);

  async function handleToggleRole(email: string, currentRole: string) {
    const newRole = currentRole === "admin" ? "player" : "admin";
    
    setAlertConfig({
      open: true,
      title: "Update User Role",
      description: `Are you sure you want to make ${email} a ${newRole}?`,
      actionText: "Update",
      variant: "default",
      onAction: async () => {
        try {
          await updateUserRole(email, newRole as any);
        } catch (error) {
          console.error("Error updating role:", error);
          setAlertConfig({
            open: true,
            title: "Update Failed",
            description: "Failed to update user role. Please try again.",
            actionText: "Close",
            variant: "default",
            onAction: () => {}
          });
        }
      }
    });
  }

  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault();
    if (!newUserEmail.trim()) return;
    setIsAddingUser(true);
    try {
      const name = newUserName.trim() || newUserEmail.split("@")[0].split(".").map((p: string) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
      await createUserProfile({ name, email: newUserEmail.trim().toLowerCase(), role: newUserRole });
      setNewUserEmail("");
      setNewUserName("");
      setNewUserRole("player");
    } catch (error) {
      console.error("Error adding user:", error);
      setAlertConfig({
        open: true,
        title: "Add Failed",
        description: "Failed to add user. Please try again.",
        actionText: "Close",
        variant: "default",
        onAction: () => {}
      });
    } finally {
      setIsAddingUser(false);
    }
  }

  async function handleSaveQuest(questData: Omit<Game, "id"> & { id?: string }) {
    await saveQuest(questData);
    setQuestModalOpen(false);
    setEditingQuest(null);
  }

  async function handleDeleteQuest(id: string, title: string) {
    setAlertConfig({
      open: true,
      title: "Delete Quest",
      description: `Are you sure you want to delete "${title}"? All submissions for this quest will remain in the database but will be disconnected.`,
      actionText: "Delete",
      variant: "destructive",
      onAction: async () => {
        await deleteQuest(id);
      }
    });
  }

  async function handleRemoveUser(email: string) {
    if (email === currentUser?.email) return; // Self-protection logic in case button is shown

    setAlertConfig({
      open: true,
      title: "Remove Team Member",
      description: `Are you sure you want to remove ${email}? This action cannot be undone.`,
      actionText: "Remove",
      variant: "destructive",
      onAction: async () => {
        const userDocId = email.replace(/[@.]/g, "_");
        await deleteDoc(doc(db, "users", userDocId));
      }
    });
  }

  if (!currentUser) return null;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <AppHeader isAdmin={true} />

      <div className="flex-1 overflow-y-auto mt-4 pr-1">

        {loading ? (
          <>
            {/* Skeleton stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white border-2 border-b-4 border-[var(--color-border)] rounded-2xl p-4 flex flex-col items-center gap-2">
                  <Skeleton className="h-8 w-10 rounded-lg" />
                  <Skeleton className="h-3 w-20 rounded-md" />
                </div>
              ))}
            </div>
            {/* Skeleton tabs */}
            <div className="flex gap-2 mt-6 mb-4">
              <Skeleton className="h-9 w-36 rounded-xl" />
              <Skeleton className="h-9 w-32 rounded-xl" />
              <Skeleton className="h-9 w-20 rounded-xl" />
            </div>
            {/* Skeleton list */}
            <div className="bg-white border-2 border-b-4 border-[var(--color-border)] rounded-2xl p-6 flex flex-col gap-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col gap-2 pb-5 border-b border-[#f0f0f0] last:border-none">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1.5 flex-1">
                      <Skeleton className="h-5 w-3/4 rounded-lg" />
                      <Skeleton className="h-3 w-1/2 rounded-md" />
                    </div>
                    <Skeleton className="h-7 w-20 rounded-full flex-shrink-0" />
                  </div>
                  <Skeleton className="h-4 w-full rounded-md" />
                  <Skeleton className="h-4 w-5/6 rounded-md" />
                  <Skeleton className="h-8 w-28 rounded-lg mt-1" />
                </div>
              ))}
            </div>
          </>
        ) : null}

        {!loading && <>

        {/* Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3" aria-label="Admin summary">
          <Card className="text-center p-4">
            <span className="text-[28px] font-black text-[var(--color-blue)] block">{games.length}</span>
            <span className="text-[11px] font-black text-[var(--color-text-muted)] uppercase mt-1">Total quests</span>
          </Card>
          <Card className="text-center p-4">
            <span className="text-[28px] font-black text-[var(--color-blue)] block">{openGames.length}</span>
            <span className="text-[11px] font-black text-[var(--color-text-muted)] uppercase mt-1">Live now</span>
          </Card>
          <Card className="text-center p-4">
            <span className="text-[28px] font-black text-[var(--color-blue)] block">{submissions.filter(s => !s.score).length}</span>
            <span className="text-[11px] font-black text-[var(--color-text-muted)] uppercase mt-1">To score</span>
          </Card>
          <Card className="text-center p-4">
            <span className="text-[28px] font-black text-[var(--color-blue)] block">{users.length}</span>
            <span className="text-[11px] font-black text-[var(--color-text-muted)] uppercase mt-1">Active users</span>
          </Card>
        </section>

        {/* Tabs */}
        <div className="flex gap-2 mt-6 mb-4 overflow-x-auto pb-2 scrollbar-hide">
          {(["submissions", "library", "users"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-xl text-[12px] font-black uppercase tracking-wider transition-all border-2 border-b-4 whitespace-nowrap ${
                activeTab === tab
                  ? "bg-[var(--color-blue)] text-white border-[var(--color-blue-dark)]"
                  : "bg-white text-[var(--color-text-muted)] border-[var(--color-border)] hover:bg-[#f0f0f0]"
              }`}
            >
              {tab === "submissions" ? `Scoring queue${submissions.length > 0 ? ` (${submissions.length})` : ""}` : tab === "library" ? "Quest Library" : "Users"}
            </button>
          ))}
        </div>

        {/* Submissions tab */}
        {activeTab === "submissions" && (
          <Card className="p-6 mb-6">
            <div className="flex justify-between items-start mb-5">
              <h2 className="text-[24px] font-black text-[var(--color-text-main)] m-0">Review submissions</h2>
              <Badge variant="game" style={{ background: 'var(--color-text-muted)', borderBottomColor: '#999' }}>
                {submissions.length} {submissions.length === 1 ? "entry" : "entries"}
              </Badge>
            </div>
            <div className="review-list">
              {submissions.length === 0 ? (
                <p className="text-[var(--color-text-muted)] text-[14px] font-black text-center py-8">No submissions yet.</p>
              ) : submissions.map((submission) => {
                const isScored = !!submission.score;
                return (
                  <div key={submission.id} style={{ borderBottom: '2px solid #f0f0f0', padding: '20px 0' }}>
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-2">
                      <div className="min-w-0">
                        <h3 style={{ fontSize: '18px', fontWeight: 900, margin: 0 }} className="truncate sm:whitespace-normal">{submission.name} — {submission.questTitle.replace(/\bRound\b/gi, "Week")}</h3>
                        <p className="text-[12px] font-black text-[var(--color-text-muted)] uppercase mt-1 truncate sm:whitespace-normal">
                          {submission.email} · {(() => {
                            if (!submission.submittedAt) return "Just now";
                            const date = (submission.submittedAt as any).toDate ? (submission.submittedAt as any).toDate() : new Date(submission.submittedAt);
                            return date.toLocaleString();
                          })()}
                        </p>
                      </div>
                      <Badge variant="game" className="flex-shrink-0" style={isScored ? {} : { background: 'var(--color-text-muted)', borderBottomColor: '#999' }}>
                        {isScored ? `${submission.score!.total}/100` : "Unscored"}
                      </Badge>
                    </div>
                    {submission.response && (
                      <p className="text-[14px] text-[var(--color-text-main)] my-3 leading-relaxed line-clamp-3">{submission.response}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[12px] font-black text-[var(--color-text-muted)]">{submission.tokensUsed.toLocaleString()} tokens</span>
                      <Link href={`/admin/submission/${submission.id}`}>
                        <Button variant="game" size="sm">{isScored ? "Edit score" : "Score entry"}</Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Library tab */}
        {activeTab === "library" && (
          <Card className="p-6 mb-6">
            <div className="flex justify-between items-start mb-5">
              <h2 className="text-[24px] font-black text-[var(--color-text-main)] m-0">Quest Library</h2>
              <Button size="sm" variant="game" onClick={() => { setEditingQuest(null); setQuestModalOpen(true); }}>New quest</Button>
            </div>
            <div className="flex flex-col">
              {games.map((game) => (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 py-4 border-b border-[#f0f0f0] last:border-none" key={game.id}>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-[14px] font-black bg-[#f0f0f0] border-2 border-[var(--color-border)] border-b-4 text-[#afafaf] flex-shrink-0">
                      {game.week}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 900, margin: 0 }}>{game.title}</h3>
                      <p className="text-[11px] font-black text-[var(--color-text-muted)] uppercase tracking-wide" style={{ fontSize: '10px', marginTop: '2px' }}>{game.meta.join(" - ")}{game.timeLimit ? ` · ${game.timeLimit} min` : ""}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <Badge variant="game">{game.statusLabel}</Badge>
                    <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => { setEditingQuest(game); setQuestModalOpen(true); }}>Edit</Button>
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-red-400 hover:text-red-600" onClick={() => handleDeleteQuest(game.id, game.title)}>✕</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Users tab */}
        {activeTab === "users" && (
          <Card className="p-6 mb-6">
            <div className="flex justify-between items-start mb-5">
              <h2 className="text-[24px] font-black text-[var(--color-text-main)] m-0">User Management</h2>
            </div>

            <form onSubmit={handleAddUser} className="flex flex-col gap-3 mb-5 pb-5 border-b-2 border-[var(--color-border)]">
              <p className="text-[11px] font-black text-[var(--color-text-muted)] uppercase tracking-wide">Add member</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input type="text" placeholder="Name (optional)" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} className="h-10 text-[13px]" />
                <Input type="email" placeholder="Email address" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} required className="h-10 text-[13px]" />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Select
                  value={newUserRole}
                  onValueChange={(value) => setNewUserRole(value as UserRole)}
                >
                  <SelectTrigger className="flex-1 h-10 rounded-lg border-2 border-[var(--color-border)] text-[12px] font-black px-4 bg-white">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="player">Player</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="submit" size="sm" variant="game" disabled={isAddingUser} className="flex-1 h-10">
                  {isAddingUser ? "Adding..." : "Add member"}
                </Button>
              </div>
            </form>

            <div className="flex flex-col gap-3">
              {users.length === 0 && <p className="text-[12px] font-bold text-[var(--color-text-muted)] text-center py-4">No users yet.</p>}
              {users.map((user) => (
                <div key={user.email} className="flex flex-col gap-1 pb-3 border-b last:border-none">
                  <div className="flex justify-between items-center">
                    <span className="text-[14px] font-black text-[var(--color-text-main)] truncate max-w-[200px]">{user.name}</span>
                    <Badge variant="game" style={user.role === 'admin' ? {} : { background: 'var(--color-text-muted)', borderBottomColor: '#999' }}>
                      {user.role}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[11px] font-bold text-[var(--color-text-muted)] truncate max-w-[200px]">{user.email}</span>
                    <div className="flex gap-1">
                      {user.email !== currentUser?.email && (
                        <Button size="sm" variant="ghost" className="h-7 text-[10px] px-2 uppercase font-black" onClick={() => handleToggleRole(user.email, user.role)}>
                          {user.role === 'admin' ? 'Make player' : 'Make admin'}
                        </Button>
                      )}
                      {user.email !== currentUser?.email && (
                        <Button size="sm" variant="ghost" className="h-7 text-[10px] px-2 uppercase font-black text-red-400 hover:text-red-600" onClick={() => handleRemoveUser(user.email)}>
                          ✕
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        </>}

      </div>

      <AlertDialog
        open={alertConfig.open}
        onOpenChange={(open) => setAlertConfig(prev => ({ ...prev, open }))}
        title={alertConfig.title}
        description={alertConfig.description}
        actionText={alertConfig.actionText}
        onAction={alertConfig.onAction}
        variant={alertConfig.variant}
      />

      <QuestModal
        open={questModalOpen}
        onOpenChange={setQuestModalOpen}
        quest={editingQuest}
        onSave={handleSaveQuest}
      />
    </div>
  );
}
