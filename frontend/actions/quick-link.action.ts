'use server';

import { INITIAL_QUICK_LINKS } from '@/data/mock-quick-links';
import { QuickLink, LinkFilterQuery, LinkCategory, TargetYear } from '@/types/quick-link.type';

// จำลองการเก็บ Data ใน Memory สำหรับ Mock (เมื่อเปลี่ยนเป็น DB จะเปลี่ยนเป็น Prisma Query)
let mockLinksStore: QuickLink[] = [...INITIAL_QUICK_LINKS];

/**
 * ดึงรายการลิงก์ทั้งหมด พร้อมค้นหาและกรอง (Filter & Search)
 */
export async function getQuickLinks(query?: LinkFilterQuery): Promise<QuickLink[]> {
  let result = [...mockLinksStore];

  if (!query) {
    return result;
  }

  const { keyword, category, targetYear } = query;

  // 1. กรองตาม Keyword (ค้นหาในชื่อ, คำอธิบาย และ Tags)
  if (keyword && keyword.trim() !== '') {
    const cleanKeyword = keyword.trim().toLowerCase();
    result = result.filter((link) => {
      const matchTitle = link.title.toLowerCase().includes(cleanKeyword);
      const matchDesc = link.description.toLowerCase().includes(cleanKeyword);
      const matchTags = link.tags.some((tag) => tag.toLowerCase().includes(cleanKeyword));
      return matchTitle || matchDesc || matchTags;
    });
  }

  // 2. กรองตามหมวดหมู่ (Category)
  if (category && category !== 'ALL') {
    result = result.filter((link) => link.category === category);
  }

  // 3. กรองตามกลุ่มชั้นปี (Target Year)
  if (targetYear && targetYear !== 'ALL') {
    result = result.filter(
      (link) => link.targetYears.includes('ALL') || link.targetYears.includes(targetYear)
    );
  }

  return result;
}

/**
 * ดึงเฉพาะลิงก์ที่ถูกปักหมุดประจำสาขา (Pinned Links)
 */
export async function getPinnedQuickLinks(): Promise<QuickLink[]> {
  return mockLinksStore.filter((link) => link.isPinned);
}

/**
 * ดึงลิงก์ยอดนิยม (Top Clicked Links) เรียงตามจำนวนการคลิกมากไปน้อย
 */
export async function getTopClickedQuickLinks(limit: number = 5): Promise<QuickLink[]> {
  return [...mockLinksStore]
    .sort((a, b) => b.clickCount - a.clickCount)
    .slice(0, limit);
}

/**
 * บันทึกการกดคลิกใช้งานลิงก์ (Increment Click Count)
 */
export async function trackLinkClick(linkId: string): Promise<{ success: boolean }> {
  const linkIndex = mockLinksStore.findIndex((l) => l.id === linkId);
  if (linkIndex !== -1) {
    mockLinksStore[linkIndex] = {
      ...mockLinksStore[linkIndex],
      clickCount: mockLinksStore[linkIndex].clickCount + 1,
      updatedAt: new Date().toISOString(),
    };
    return { success: true };
  }
  return { success: false };
}