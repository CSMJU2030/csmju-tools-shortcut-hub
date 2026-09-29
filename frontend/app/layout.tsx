import type { Metadata } from "next";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/ibm-plex-sans-thai/400.css";
import "@fontsource/ibm-plex-sans-thai/500.css";
import "@fontsource/ibm-plex-sans-thai/600.css";
import "./globals.css";
import { CsmjuAppShell } from "../components/layout/csmju-app-shell";

export const metadata: Metadata = {
  title: "รวมเครื่องมือภาควิชาฯ | CSMJU",
  description: "ศูนย์รวมทางลัดระบบ เว็บไซต์ และเครื่องมือสำคัญประจำสาขาวิทยาการคอมพิวเตอร์",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-body">
        <CsmjuAppShell>{children}</CsmjuAppShell>
      </body>
    </html>
  );
}
