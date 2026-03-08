import type { Metadata } from "next";
import "./globals.css";
import SessionWrapper from "@/components/SessionWrapper";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "SMMP - Social Media Marketing Panel",
  description:
    "The fastest and most reliable SMM panel. Boost your social media growth with affordable services.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50">
        <SessionWrapper>
          <ToastProvider>{children}</ToastProvider>
        </SessionWrapper>
      </body>
    </html>
  );
}

