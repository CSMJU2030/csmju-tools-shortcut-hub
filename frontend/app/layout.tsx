import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import { CsmjuAppShell } from "@/csmju";

const displayFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
});

const bodyFont = Noto_Sans_Thai({
  subsets: ["latin", "thai"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "รวมเครื่องมือภาควิชาฯ | CSMJU",
  description: "ศูนย์รวมทางลัดระบบ เว็บไซต์ และเครื่องมือสำคัญประจำสาขาวิทยาการคอมพิวเตอร์",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${displayFont.variable} ${bodyFont.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-body">
        <CsmjuAppShell>{children}</CsmjuAppShell>
      </body>
    </html>
  );
}
