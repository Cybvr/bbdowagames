import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Brief to Brilliant",
  description: "An agency AI challenge game for briefs, scoring, and leaderboards.",
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
