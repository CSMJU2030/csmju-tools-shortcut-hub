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

  // TODO: เปลี่ยนไปใช้ backend แทนการเก็บใน State เมื่อ API เสร็จสมบูรณ์
  // อ่านจาก State เท่านั้น ไม่มีการใช้ localStorage

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
      <div className="max-w-[1280px] mx-auto space-y-8">
        
        {/* Header ส่วนหัวระบบ */}
        <header className="brand-gradient text-on-primary rounded-[12px] p-6 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-sm text-label-sm rounded-full mb-3 text-primary-fixed">
              CSMJU 2030 Directory Portal
            </span>
            <h1 className="text-headline-md sm:text-headline-lg font-display mb-2">
              CS Quick-Link Hub
            </h1>
            <p className="text-body-sm sm:text-body-md text-primary-fixed opacity-90 leading-relaxed">
              ศูนย์รวมทางลัดระบบ เว็บไซต์ และเครื่องมือสำคัญประจำสาขาวิทยาการคอมพิวเตอร์
            </p>
          </div>
        </header>

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
              <span className="text-brand-amber text-lg">★</span>
              <h2 className="text-headline-md text-on-surface">ลิงก์ปักหมุดประจำสาขา</h2>
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
              <div className="text-4xl">🔍</div>
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