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
  // TODO: Replace with real user data from Core Hub when auth is implemented
  const mockUser = {
    initials: "U",
    roleLabel: "ผู้ใช้งานทั่วไป",
  };

  const nav = [
    { label: "หน้าหลัก", href: "/quick-links", icon: "dashboard" as const },
    { label: "ที่บันทึกไว้", href: "/bookmarks", icon: "menu-book" as const },
    { label: "จัดการลิงก์", href: "/admin/quick-links", icon: "settings" as const },
  ];

  return (
    <html lang="th" className={`${displayFont.variable} ${bodyFont.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-body">
        <CsmjuAppShell
          displayName="CS Tools Shortcut Hub"
          nav={nav}
          user={mockUser}
          coreHubUrl={process.env.CORE_HUB_WEB_URL}
        >
          {children}
        </CsmjuAppShell>
      </body>
    </html>
  );
}
