'use client';

import { LinkCategory, TargetYear } from '@/types/quick-link.type';

interface CategoryFilterProps {
  selectedCategory: LinkCategory | 'ALL';
  onSelectCategory: (category: LinkCategory | 'ALL') => void;
  selectedYear: TargetYear;
  onSelectYear: (year: TargetYear) => void;
}

const CATEGORY_OPTIONS: { label: string; value: LinkCategory | 'ALL' }[] = [
  { label: 'ทั้งหมด', value: 'ALL' },
  { label: 'การเรียน/ลงทะเบียน', value: 'ACADEMIC' },
  { label: 'เครื่องมือ Dev', value: 'DEV_TOOLS' },
  { label: 'ข้อมูลสาขา/มหาลัย', value: 'FACULTY_INFO' },
  { label: 'ชุมชน/พูดคุย', value: 'COMMUNITY' },
  { label: 'อื่นๆ', value: 'OTHER' },
];

const YEAR_OPTIONS: { label: string; value: TargetYear }[] = [
  { label: 'ทุกชั้นปี', value: 'ALL' },
  { label: 'ปี 1', value: 'YEAR_1' },
  { label: 'ปี 2', value: 'YEAR_2' },
  { label: 'ปี 3', value: 'YEAR_3' },
  { label: 'ปี 4', value: 'YEAR_4' },
];

export function CategoryFilter({
  selectedCategory,
  onSelectCategory,
  selectedYear,
  onSelectYear,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-col gap-4 w-full my-4">
      {/* หมวดหมู่หลัก */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-xs font-semibold text-slate-500 whitespace-nowrap mr-1">หมวดหมู่:</span>
        {CATEGORY_OPTIONS.map((item) => {
          const isActive = selectedCategory === item.value;
          return (
            <button
              key={item.value}
              onClick={() => onSelectCategory(item.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'bg-[#004C99] text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-[#E6F2FF] hover:text-[#004C99] border border-slate-200'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* ตัวกรองชั้นปี */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-xs font-semibold text-slate-500 whitespace-nowrap mr-1">ระดับชั้นปี:</span>
        {YEAR_OPTIONS.map((item) => {
          const isActive = selectedYear === item.value;
          return (
            <button
              key={item.value}
              onClick={() => onSelectYear(item.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}