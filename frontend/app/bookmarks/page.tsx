import { getMe, isUnauthorized } from "@/lib/api";
import { ReSignIn, PageHeader } from "@/csmju";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function BookmarksPage() {
  const meResult = await getMe();

  // auth-contract 7: If API returns 401, navigate whole page to /auth/login with loop guard
  if (isUnauthorized(meResult)) {
    return <ReSignIn next="/bookmarks" />;
  }

  const me = meResult.ok ? meResult.data : null;

  return (
    <div className="min-h-screen bg-background text-on-surface py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <PageHeader
          title="ลิงก์ที่บันทึกไว้ (Bookmarks)"
          description={`รายการทางลัดส่วนตัวสำหรับ ${me?.email || "ผู้ใช้งาน"}`}
        />

        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-8 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary-container/10 text-primary-container flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          </div>
          <h2 className="text-title-lg font-bold text-on-surface">ยังไม่มีลิงก์ที่บันทึกไว้</h2>
          <p className="text-body-md text-outline max-w-md mx-auto">
            คุณสามารถกดไอคอนรูปดาวที่การ์ดลิงก์ในหน้ารวมเครื่องมือ เพื่อบันทึกเป็นทางลัดส่วนตัวไว้ที่นี่ได้
          </p>
          <div className="pt-2">
            <Link
              href="/quick-links"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg btn-gradient text-white text-label-md shadow-md"
            >
              ไปที่หน้ารวมเครื่องมือ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
