import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { BottomNav } from "@/components/BottomNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sortér – scan skrald og se hvilken spand det skal i",
  description:
    "Tag et billede af dit affald og få svar med det samme: Hvilken skraldespand skal det i? Efter de danske sorteringsregler.",
  applicationName: "Sortér",
  appleWebApp: { capable: true, title: "Sortér", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#f4f1ea",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="da">
      <body className="min-h-dvh antialiased">
        <div className="mx-auto min-h-dvh w-full max-w-md px-4 pb-32 pt-[max(1rem,env(safe-area-inset-top))]">
          {children}
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
