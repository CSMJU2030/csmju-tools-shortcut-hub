'use client';

import { QuickLink } from '@/types/quick-link.type';
import { trackLinkClick } from '@/actions/quick-link.action';

interface LinkCardProps {
  link: QuickLink;
  isBookmarked?: boolean;
  onToggleBookmark?: (linkId: string) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  ACADEMIC: 'การเรียน',
  DEV_TOOLS: 'เครื่องมือ Dev',
  FACULTY_INFO: 'ข้อมูลสาขา',
  COMMUNITY: 'ชุมชน',
  OTHER: 'ทั่วไป',
};

export function LinkCard({ link, isBookmarked = false, onToggleBookmark }: LinkCardProps) {
  const handleClickLink = async () => {
    // บันทึกการกดคลิกลงใน Server Actions
    await trackLinkClick(link.id);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-lg transition-all duration-300 flex flex-col justify-between relative group hover:border-[#004C99]/30">
      {/* Header ของ Card: หมวดหมู่ + ปุ่ม Bookmark */}
      <div>
        <div className="flex justify-between items-start mb-3 gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 bg-[#E6F2FF] text-[#004C99] text-xs font-semibold rounded-md">
              {CATEGORY_LABELS[link.category] || link.category}
            </span>
            {link.isPinned && (
              <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold rounded-md flex items-center gap-1">
                ★ ปักหมุดสาขา
              </span>
            )}
          </div>

          {onToggleBookmark && (
            <button
              onClick={() => onToggleBookmark(link.id)}
              aria-label={isBookmarked ? 'ยกเลิกการปักหมุดส่วนตัว' : 'ปักหมุดส่วนตัว'}
              className="text-slate-300 hover:text-amber-400 transition-colors p-1"
            >
              <svg
                className={`w-5 h-5 ${isBookmarked ? 'text-amber-400 fill-amber-400' : 'fill-none'}`}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </button>
          )}
        </div>

        {/* ชื่อลิงก์และคำอธิบาย */}
        <h3 className="text-base font-bold text-slate-800 group-hover:text-[#004C99] transition-colors mb-2 line-clamp-1">
          {link.title}
        </h3>
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
          {link.description}
        </p>
      </div>

      {/* Footer ของ Card: Tags + ปุ่มกดไปเว็บปลายทาง */}
      <div>
        <div className="flex flex-wrap gap-1 mb-4">
          {link.tags.slice(0, 3).map((tag, idx) => (
            <span key={idx} className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <span className="text-[11px] text-slate-400">
            ใช้งานแล้ว {link.clickCount.toLocaleString()} ครั้ง
          </span>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClickLink}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#004C99] hover:underline"
          >
            <span>ไปยังเว็บไซต์</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}