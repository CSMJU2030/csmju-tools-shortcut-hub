import { getMe, isUnauthorized } from "@/lib/api";
import { ReSignIn, PageHeader } from "@/csmju";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminQuickLinksPage() {
  const meResult = await getMe();

  // auth-contract 7: If API returns 401, navigate whole page to /auth/login with loop guard
  if (isUnauthorized(meResult)) {
    return <ReSignIn next="/admin/quick-links" />;
  }

  const me = meResult.ok ? meResult.data : null;
  const isStaffOrAdmin = me?.subsystemRole === "STAFF" || me?.subsystemRole === "ADMIN";

  if (!isStaffOrAdmin) {
    return (
      <div className="min-h-screen bg-background text-on-surface py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-surface-container-lowest border border-error/30 rounded-xl p-8 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 mx-auto rounded-full bg-error-container text-on-error-container flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-headline-md font-bold text-error">403 — ไม่มีสิทธิ์เข้าถึง</h1>
            <p className="text-body-md text-on-surface-variant max-w-md mx-auto">
              หน้านี้สงวนไว้สำหรับอาจารย์ (Lecturer) และเจ้าหน้าที่ (Staff/Admin) เท่านั้น บัญชีของคุณมีบทบาทเป็น {me?.coreRole}
            </p>
            <div className="pt-2">
              <Link
                href="/quick-links"
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg btn-gradient text-white text-label-md shadow-md"
              >
                กลับหน้าหลัก
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <PageHeader
          title="จัดการรายการทางลัด (Admin Quick Links)"
          description={`ผู้ดูแลระบบ: ${me?.email} (Role: ${me?.subsystemRole})`}
        />

        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-title-lg font-bold text-on-surface">รายการลิงก์ในระบบ</h2>
              <p className="text-body-sm text-outline">จัดการ แก้ไข และปักหมุดลิงก์เครื่องมือของภาควิชา</p>
            </div>
            <button
              type="button"
              className="px-4 py-2.5 rounded-lg btn-gradient text-white text-label-md shadow-md inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              เพิ่มลิงก์ใหม่
            </button>
          </div>

          <div className="rounded-lg border border-outline-variant/30 p-6 text-center text-outline">
            อยู่ระหว่างดึงข้อมูลรายการทางลัดสำหรับผู้ดูแลระบบ
          </div>
        </div>
      </div>
    </div>
  );
}
