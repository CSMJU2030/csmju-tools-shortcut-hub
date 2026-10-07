'use client';

import { useState, useEffect, useTransition } from 'react';
import { QuickLink, LinkCategory, TargetYear } from '@/types/quick-link.type';
import { getQuickLinks, getPinnedQuickLinks } from '@/actions/quick-link.action';
import { SearchBar } from '@/components/quick-link/search-bar';
import { CategoryFilter } from '@/components/quick-link/category-filter';
import { LinkCard } from '@/components/quick-link/link-card';

export default function QuickLinksPage() {
  const [links, setLinks] = useState<QuickLink[]>([]);
  const [pinnedLinks, setPinnedLinks] = useState<QuickLink[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<LinkCategory | 'ALL'>('ALL');
  const [selectedYear, setSelectedYear] = useState<TargetYear>('ALL');
  const [myBookmarks, setMyBookmarks] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  // ตรวจสอบสถานะการเข้าสู่ระบบ
  useEffect(() => {
    fetch('/api/v1/me')
      .then((res) => setIsLoggedIn(res.ok))
      .catch(() => setIsLoggedIn(false));
  }, []);

  // ดึงข้อมูลลิงก์ปักหมุดของสาขา
  useEffect(() => {
    getPinnedQuickLinks().then(setPinnedLinks);
  }, []);

  // ค้นหาและกรองลิงก์เมื่อมีการเปลี่ยน Filter หรือ Search
  useEffect(() => {
    startTransition(async () => {
      const data = await getQuickLinks({
        keyword: searchKeyword,
        category: selectedCategory,
        targetYear: selectedYear,
      });
      setLinks(data);
    });
  }, [searchKeyword, selectedCategory, selectedYear]);

  // สลับการปักหมุด Bookmark ส่วนตัว
  const handleToggleBookmark = (linkId: string) => {
    let updated: string[];
    if (myBookmarks.includes(linkId)) {
      updated = myBookmarks.filter((id) => id !== linkId);
    } else {
      updated = [...myBookmarks, linkId];
    }
    setMyBookmarks(updated);
  };

  return (
    <div className="min-h-screen bg-background text-on-surface py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header ส่วนหัวระบบ */}
        <header className="brand-gradient text-on-primary rounded-xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-sm text-label-sm rounded-full mb-3 text-primary-fixed">
              CSMJU 2030 Directory Portal
            </span>
            <h1 className="text-3xl sm:text-4xl font-display mb-2">
              รวมเครื่องมือภาควิชาฯ
            </h1>
            <p className="text-body-sm sm:text-body-md text-primary-fixed opacity-90 leading-relaxed">
              ศูนย์รวมทางลัดระบบ เว็บไซต์ และเครื่องมือสำคัญประจำสาขาวิทยาการคอมพิวเตอร์
            </p>
          </div>
        </header>
        
        {/* แถบเข้าสู่ระบบสำหรับผู้เยี่ยมชม */}
        {isLoggedIn === false && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-container/10 text-primary-container flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-title-sm font-semibold text-on-surface">
                  เข้าสู่ระบบด้วย CSMJU Core Hub
                </p>
                <p className="text-body-sm text-outline">
                  เข้าสู่ระบบเพื่อบันทึกรายการทางลัดส่วนตัว และเข้าถึงสิทธิ์การใช้งานตามบทบาทของคุณ
                </p>
              </div>
            </div>
            <a
              href="/auth/login?next=/quick-links"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg btn-gradient text-white text-label-md shadow-md shrink-0 transition-opacity hover:opacity-90"
            >
              เข้าสู่ระบบ
            </a>
          </div>
        )}

        {/* ค้นหาและตัวกรอง */}
        <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/40 shadow-sm space-y-4">
          <SearchBar value={searchKeyword} onChange={setSearchKeyword} />
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            selectedYear={selectedYear}
            onSelectYear={setSelectedYear}
          />
        </section>

        {/* ส่วนลิงก์ปักหมุดประจำสาขา (Pinned Links) */}
        {pinnedLinks.length > 0 && searchKeyword === '' && selectedCategory === 'ALL' && (
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-brand-amber" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <h2 className="text-xl font-bold text-on-surface">ลิงก์ปักหมุดประจำสาขา</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pinnedLinks.map((link) => (
                <LinkCard
                  key={`pinned-${link.id}`}
                  link={link}
                  isBookmarked={myBookmarks.includes(link.id)}
                  onToggleBookmark={handleToggleBookmark}
                />
              ))}
            </div>
          </section>
        )}

        {/* รายการลิงก์ทั้งหมด */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-headline-md text-on-surface">
              {searchKeyword || selectedCategory !== 'ALL' || selectedYear !== 'ALL'
                ? `ผลการค้นหา (${links.length} รายการ)`
                : 'รายการลิงก์ทั้งหมด'}
            </h2>
            {isPending && <span className="text-label-sm text-primary-container animate-pulse">กำลังโหลด...</span>}
          </div>

          {links.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {links.map((link) => (
                <LinkCard
                  key={link.id}
                  link={link}
                  isBookmarked={myBookmarks.includes(link.id)}
                  onToggleBookmark={handleToggleBookmark}
                />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-surface-container-lowest border border-dashed border-outline-variant/40 rounded-xl p-12 text-center space-y-3">
              <svg className="w-12 h-12 mx-auto text-outline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-body-md font-bold text-on-surface-variant">ไม่พบลิงก์ที่คุณกำลังค้นหา</h3>
              <p className="text-caption text-secondary max-w-sm mx-auto">
                ลองเปลี่ยนคำค้นหา หรือรีเซ็ตตัวกรองหมวดหมู่และชั้นปีใหม่อีกครั้ง
              </p>
              <button
                onClick={() => {
                  setSearchKeyword('');
                  setSelectedCategory('ALL');
                  setSelectedYear('ALL');
                }}
                className="mt-2 px-4 py-2 bg-primary-container/10 text-primary-container text-label-md rounded-lg hover:bg-primary-container hover:text-on-primary transition-colors"
              >
                ล้างคำค้นหาทั้งหมด
              </button>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}