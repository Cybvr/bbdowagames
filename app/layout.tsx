import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "WieldQuest",
  description: "Use AI as your weapon. Tackle weekly creative quests and climb the leaderboard.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="mx-auto max-w-[960px] w-full h-screen flex flex-col px-5 pt-4 pb-4 overflow-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}
