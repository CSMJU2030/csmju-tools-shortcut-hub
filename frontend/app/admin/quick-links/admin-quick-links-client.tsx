'use client';

import { useState } from 'react';
import { QuickLink, LinkCategory, TargetYear, CreateQuickLinkInput } from '@/types/quick-link.type';
import {
  createQuickLinkAction,
  updateQuickLinkAction,
  deleteQuickLinkAction,
  togglePinQuickLinkAction,
} from '@/actions/quick-link.action';

interface AdminQuickLinksClientProps {
  initialLinks: QuickLink[];
  currentUser: {
    email: string;
    subsystemRole: string;
  };
}

const CATEGORY_MAP: Record<LinkCategory, { label: string; badgeClass: string }> = {
  ACADEMIC: {
    label: 'การเรียน/ลงทะเบียน',
    badgeClass: 'bg-primary-container/15 text-primary-container border-primary-container/30',
  },
  DEV_TOOLS: {
    label: 'เครื่องมือ Dev',
    badgeClass: 'bg-secondary-container/25 text-on-secondary-container border-secondary-container/40',
  },
  FACULTY_INFO: {
    label: 'ข้อมูลสาขา/มหาลัย',
    badgeClass: 'bg-tertiary-container/20 text-on-tertiary-container border-tertiary-container/30',
  },
  COMMUNITY: {
    label: 'ชุมชน/ติดต่อ',
    badgeClass: 'bg-surface-variant text-on-surface-variant border-outline-variant/40',
  },
  OTHER: {
    label: 'ทั่วไป',
    badgeClass: 'bg-surface-container-high text-on-surface-variant border-outline-variant/30',
  },
};

const YEAR_MAP: Record<TargetYear, string> = {
  ALL: 'ทุกชั้นปี',
  YEAR_1: 'ปี 1',
  YEAR_2: 'ปี 2',
  YEAR_3: 'ปี 3',
  YEAR_4: 'ปี 4',
};

const ALL_CATEGORIES: LinkCategory[] = ['ACADEMIC', 'DEV_TOOLS', 'FACULTY_INFO', 'COMMUNITY', 'OTHER'];
const ALL_YEARS: TargetYear[] = ['ALL', 'YEAR_1', 'YEAR_2', 'YEAR_3', 'YEAR_4'];

export function AdminQuickLinksClient({ initialLinks, currentUser }: AdminQuickLinksClientProps) {
  const [links, setLinks] = useState<QuickLink[]>(initialLinks);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<LinkCategory | 'ALL'>('ALL');
  const [filterPinnedOnly, setFilterPinnedOnly] = useState(false);

  // Form modal state (Create / Edit)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<LinkCategory>('ACADEMIC');
  const [formTargetYears, setFormTargetYears] = useState<TargetYear[]>(['ALL']);
  const [formTags, setFormTags] = useState('');
  const [formIsPinned, setFormIsPinned] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete dialog state
  const [deletingLink, setDeletingLink] = useState<QuickLink | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Notification Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormTitle('');
    setFormUrl('');
    setFormDescription('');
    setFormCategory('ACADEMIC');
    setFormTargetYears(['ALL']);
    setFormTags('');
    setFormIsPinned(false);
    setFormError(null);
    setIsFormOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (link: QuickLink) => {
    setEditingId(link.id);
    setFormTitle(link.title);
    setFormUrl(link.url);
    setFormDescription(link.description || '');
    setFormCategory(link.category);
    setFormTargetYears(link.targetYears && link.targetYears.length > 0 ? link.targetYears : ['ALL']);
    setFormTags(link.tags ? link.tags.join(', ') : '');
    setFormIsPinned(link.isPinned);
    setFormError(null);
    setIsFormOpen(true);
  };

  // Toggle year selection in form
  const handleToggleYear = (year: TargetYear) => {
    if (year === 'ALL') {
      setFormTargetYears(['ALL']);
      return;
    }
    const withoutAll = formTargetYears.filter((y) => y !== 'ALL');
    if (withoutAll.includes(year)) {
      const next = withoutAll.filter((y) => y !== year);
      setFormTargetYears(next.length === 0 ? ['ALL'] : next);
    } else {
      setFormTargetYears([...withoutAll, year]);
    }
  };

  // Submit Create or Edit Form
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedTitle = formTitle.trim();
    let trimmedUrl = formUrl.trim();

    if (!trimmedTitle) {
      setFormError('กรุณากรอกชื่อทางลัด');
      return;
    }

    if (!trimmedUrl) {
      setFormError('กรุณากรอก URL เว็บไซต์');
      return;
    }

    // Auto-prefix https:// if missing protocol
    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      trimmedUrl = `https://${trimmedUrl}`;
    }

    try {
      new URL(trimmedUrl);
    } catch {
      setFormError('URL ไม่ถูกต้อง ตัวอย่างที่ถูกต้อง: https://reg.mju.ac.th');
      return;
    }

    const tagsArray = formTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const payload: CreateQuickLinkInput = {
      title: trimmedTitle,
      url: trimmedUrl,
      description: formDescription.trim() || undefined,
      category: formCategory,
      targetYears: formTargetYears,
      tags: tagsArray,
      isPinned: formIsPinned,
    };

    setIsSubmitting(true);

    try {
      if (editingId) {
        // Edit existing link
        const res = await updateQuickLinkAction(editingId, payload);
        if (!res.ok) {
          setFormError(res.message || 'ไม่สามารถแก้ไขทางลัดได้');
        } else {
          setLinks((prev) => prev.map((item) => (item.id === editingId && res.data ? res.data : item)));
          setIsFormOpen(false);
          showToast('แก้ไขข้อมูลทางลัดสำเร็จ');
        }
      } else {
        // Create new link
        const res = await createQuickLinkAction(payload);
        if (!res.ok) {
          setFormError(res.message || 'ไม่สามารถสร้างทางลัดได้');
        } else {
          if (res.data) {
            setLinks((prev) => [res.data!, ...prev]);
          }
          setIsFormOpen(false);
          showToast('เพิ่มรายการทางลัดใหม่เรียบร้อยแล้ว');
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์';
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Pinned
  const handleTogglePin = async (link: QuickLink) => {
    const nextPinned = !link.isPinned;
    // Optimistic UI update
    setLinks((prev) => prev.map((item) => (item.id === link.id ? { ...item, isPinned: nextPinned } : item)));

    const res = await togglePinQuickLinkAction(link.id, nextPinned);
    if (!res.ok) {
      // Revert if failed
      setLinks((prev) => prev.map((item) => (item.id === link.id ? { ...item, isPinned: link.isPinned } : item)));
      showToast(res.message || 'ไม่สามารถเปลี่ยนสถานะการปักหมุดได้', 'error');
    } else {
      showToast(nextPinned ? 'ปักหมุดรายการทางลัดแล้ว' : 'ยกเลิกการปักหมุดแล้ว');
    }
  };

  // Delete Link
  const handleConfirmDelete = async () => {
    if (!deletingLink) return;

    setIsDeleting(true);
    try {
      const res = await deleteQuickLinkAction(deletingLink.id);
      if (!res.ok) {
        showToast(res.message || 'ไม่สามารถลบรายการทางลัดได้', 'error');
      } else {
        setLinks((prev) => prev.filter((item) => item.id !== deletingLink.id));
        showToast('ลบรายการทางลัดเรียบร้อยแล้ว');
        setDeletingLink(null);
      }
    } catch {
      showToast('เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter links
  const filteredLinks = links.filter((link) => {
    if (filterPinnedOnly && !link.isPinned) return false;
    if (selectedCategory !== 'ALL' && link.category !== selectedCategory) return false;
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const matchTitle = link.title?.toLowerCase().includes(query);
      const matchDesc = link.description?.toLowerCase().includes(query);
      const matchUrl = link.url?.toLowerCase().includes(query);
      const matchTags = link.tags?.some((t) => t.toLowerCase().includes(query));
      if (!matchTitle && !matchDesc && !matchUrl && !matchTags) return false;
    }
    return true;
  });

  const totalPinned = links.filter((l) => l.isPinned).length;
  const totalClicks = links.reduce((sum, l) => sum + (l.clickCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg border flex items-center gap-3 transition-all duration-300 ${
            toast.type === 'success'
              ? 'bg-surface-container-lowest text-on-surface border-primary-container/40'
              : 'bg-error-container text-on-error-container border-error/40'
          }`}
        >
          {toast.type === 'success' ? (
            <svg className="w-5 h-5 text-primary-container" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <span className="text-body-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-body-sm text-outline">ลิงก์ทั้งหมดในระบบ</p>
            <p className="text-headline-md font-bold text-on-surface mt-1">{links.length.toLocaleString()}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary-container/10 text-primary-container flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-body-sm text-outline">ปักหมุดแนะนำประจำสาขา</p>
            <p className="text-headline-md font-bold text-on-surface mt-1">{totalPinned.toLocaleString()}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-body-sm text-outline">สถิติการคลิกใช้งานรวม</p>
            <p className="text-headline-md font-bold text-on-surface mt-1">{totalClicks.toLocaleString()}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-secondary-container/20 text-on-secondary-container flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Category Filters, and Add Button */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <svg
              className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-outline"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="ค้นหาชื่อทางลัด, คำอธิบาย, URL หรือแท็ก..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-outline-variant/50 bg-surface text-on-surface placeholder:text-outline text-body-sm focus:outline-none focus:border-primary-container"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setFilterPinnedOnly(!filterPinnedOnly)}
              className={`px-3.5 py-2.5 rounded-lg text-label-sm border transition-colors inline-flex items-center gap-2 ${
                filterPinnedOnly
                  ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold'
                  : 'bg-surface text-on-surface-variant border-outline-variant/50 hover:bg-surface-container'
              }`}
            >
              <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span>เฉพาะที่ปักหมุด</span>
            </button>

            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="px-4 py-2.5 rounded-lg btn-gradient text-white text-label-md shadow-md inline-flex items-center gap-2 hover:opacity-95 transition-opacity"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              เพิ่มทางลัดใหม่
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-outline-variant/20">
          <span className="text-label-sm text-outline mr-2">หมวดหมู่:</span>
          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg text-label-sm transition-colors ${
              selectedCategory === 'ALL'
                ? 'bg-primary-container text-on-primary font-semibold'
                : 'bg-surface text-on-surface-variant hover:bg-surface-container border border-outline-variant/30'
            }`}
          >
            ทั้งหมด ({links.length})
          </button>
          {ALL_CATEGORIES.map((cat) => {
            const count = links.filter((l) => l.category === cat).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-label-sm transition-colors ${
                  isSelected
                    ? 'bg-primary-container text-on-primary font-semibold'
                    : 'bg-surface text-on-surface-variant hover:bg-surface-container border border-outline-variant/30'
                }`}
              >
                {CATEGORY_MAP[cat].label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Links Table */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-outline-variant/30 flex items-center justify-between">
          <div>
            <h3 className="text-title-md font-bold text-on-surface">
              รายการทางลัด ({filteredLinks.length} รายการ)
            </h3>
            <p className="text-body-xs text-outline mt-0.5">
              จัดการโดย {currentUser.email} &bull; สิทธิ์: {currentUser.subsystemRole}
            </p>
          </div>

        </div>

        {filteredLinks.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-surface-container flex items-center justify-center text-outline">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h4 className="text-title-sm font-semibold text-on-surface">ไม่พบรายการทางลัด</h4>
            <p className="text-body-sm text-outline max-w-sm mx-auto">
              {searchQuery || selectedCategory !== 'ALL' || filterPinnedOnly
                ? 'ลองปรับเปลี่ยนคำค้นหา หรือรีเซ็ตตัวกรองหมวดหมู่'
                : 'ยังไม่มีรายการทางลัดในระบบ คลิกปุ่ม "เพิ่มทางลัดใหม่" เพื่อเริ่มต้นลงทะเบียนลิงก์แรก'}
            </p>
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="px-4 py-2 rounded-lg btn-gradient text-white text-label-sm inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              เพิ่มทางลัดแรก
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-body-sm">
              <thead className="bg-surface-container text-on-surface-variant text-label-sm border-b border-outline-variant/30">
                <tr>
                  <th scope="col" className="py-3 px-4 w-12 text-center">หมุด</th>
                  <th scope="col" className="py-3 px-4">ชื่อทางลัด / คำอธิบาย</th>
                  <th scope="col" className="py-3 px-4">หมวดหมู่</th>
                  <th scope="col" className="py-3 px-4">กลุ่มเป้าหมาย</th>
                  <th scope="col" className="py-3 px-4 text-center">สถิติคลิก</th>
                  <th scope="col" className="py-3 px-4 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {filteredLinks.map((link) => {
                  const catConfig = CATEGORY_MAP[link.category] || CATEGORY_MAP.OTHER;
                  return (
                    <tr key={link.id} className="hover:bg-surface-container/50 transition-colors">
                      {/* Pinned toggle */}
                      <td className="py-4 px-4 text-center align-top">
                        <button
                          type="button"
                          onClick={() => handleTogglePin(link)}
                          aria-label={link.isPinned ? 'ยกเลิกการปักหมุด' : 'ปักหมุดประจำสาขา'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            link.isPinned
                              ? 'text-amber-600 bg-amber-50 hover:bg-amber-100'
                              : 'text-outline-variant hover:text-amber-500 hover:bg-surface-container'
                          }`}
                        >
                          <svg
                            className={`w-5 h-5 ${link.isPinned ? 'fill-current' : 'fill-none'}`}
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        </button>
                      </td>

                      {/* Title & Description & URL */}
                      <td className="py-4 px-4 align-top max-w-xs sm:max-w-md">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-on-surface text-body-md">{link.title}</span>
                            {link.isPinned && (
                              <span className="px-2 py-0.5 rounded text-caption bg-amber-100 text-amber-800 border border-amber-300">
                                แนะนำ
                              </span>
                            )}
                          </div>
                          {link.description && (
                            <p className="text-body-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                              {link.description}
                            </p>
                          )}
                          <div className="pt-1 flex items-center gap-2">
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-body-xs text-primary-container hover:underline inline-flex items-center gap-1 font-mono truncate max-w-xs"
                            >
                              <span>{link.url}</span>
                              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          </div>
                          {link.tags && link.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {link.tags.map((tag, i) => (
                                <span key={i} className="text-caption px-1.5 py-0.5 rounded bg-surface-container text-outline">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="py-4 px-4 align-top">
                        <span className={`inline-block px-2.5 py-1 rounded-md text-label-xs border ${catConfig.badgeClass}`}>
                          {catConfig.label}
                        </span>
                      </td>

                      {/* Target Years */}
                      <td className="py-4 px-4 align-top">
                        <div className="flex flex-wrap gap-1">
                          {link.targetYears && link.targetYears.length > 0 ? (
                            link.targetYears.map((yr) => (
                              <span key={yr} className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant text-caption">
                                {YEAR_MAP[yr] || yr}
                              </span>
                            ))
                          ) : (
                            <span className="text-caption text-outline">ทุกชั้นปี</span>
                          )}
                        </div>
                      </td>

                      {/* Clicks */}
                      <td className="py-4 px-4 align-top text-center">
                        <span className="px-2.5 py-1 rounded-md bg-surface-container text-on-surface font-mono text-body-xs">
                          {(link.clickCount || 0).toLocaleString()}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 align-top text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(link)}
                            aria-label={`แก้ไข ${link.title}`}
                            className="p-2 rounded-lg text-on-surface-variant hover:text-primary-container hover:bg-surface-container transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          {currentUser.subsystemRole === 'ADMIN' && (
                            <button
                              type="button"
                              onClick={() => setDeletingLink(link)}
                              aria-label={`ลบ ${link.title}`}
                              className="p-2 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container/20 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}

                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Dialog: Create / Edit Quick Link */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-container/10 text-primary-container flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <div>
                  <h3 id="modal-title" className="text-title-lg font-bold text-on-surface">
                    {editingId ? 'แก้ไขรายการทางลัด' : 'ลงทะเบียนทางลัดใหม่'}
                  </h3>
                  <p className="text-body-xs text-outline">
                    {editingId ? 'ปรับปรุงข้อมูลลิงก์เครื่องมือในระบบ' : 'เพิ่มลิงก์เครื่องมือและบริการสำหรับภาควิชาฯ'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-2 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {formError && (
              <div className="p-4 rounded-xl bg-error-container text-on-error-container border border-error/30 text-body-sm flex items-start gap-3">
                <svg className="w-5 h-5 shrink-0 text-error mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-label-md font-semibold text-on-surface mb-1.5">
                  ชื่อทางลัด (Title) <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ระบบบริการการศึกษา (MJU REG)"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/60 bg-surface text-on-surface text-body-sm focus:outline-none focus:border-primary-container"
                />
              </div>

              {/* URL */}
              <div>
                <label className="block text-label-md font-semibold text-on-surface mb-1.5">
                  URL เว็บไซต์ปลายทาง <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น https://reg.mju.ac.th"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/60 bg-surface text-on-surface font-mono text-body-sm focus:outline-none focus:border-primary-container"
                />
                <p className="text-caption text-outline mt-1">
                  ระบบจะเติม https:// ให้อัตโนมัติหากไม่ได้ระบุโพรโทคอล
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-label-md font-semibold text-on-surface mb-1.5">
                  คำอธิบายทางลัด (Description)
                </label>
                <textarea
                  rows={2}
                  placeholder="เช่น ตรวจสอบผลการเรียน ลงทะเบียนรายวิชา และตารางสอบ"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/60 bg-surface text-on-surface text-body-sm focus:outline-none focus:border-primary-container resize-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-label-md font-semibold text-on-surface mb-1.5">
                  หมวดหมู่ (Category) <span className="text-error">*</span>
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as LinkCategory)}
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/60 bg-surface text-on-surface text-body-sm focus:outline-none focus:border-primary-container"
                >
                  {ALL_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {CATEGORY_MAP[cat].label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Years */}
              <div>
                <label className="block text-label-md font-semibold text-on-surface mb-1.5">
                  กลุ่มเป้าหมาย (Target Years)
                </label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {ALL_YEARS.map((year) => {
                    const isSelected = formTargetYears.includes(year);
                    return (
                      <button
                        key={year}
                        type="button"
                        onClick={() => handleToggleYear(year)}
                        className={`px-3 py-1.5 rounded-lg text-label-sm border transition-colors ${
                          isSelected
                            ? 'bg-primary-container/15 text-primary-container border-primary-container font-semibold'
                            : 'bg-surface text-on-surface-variant border-outline-variant/40 hover:bg-surface-container'
                        }`}
                      >
                        {YEAR_MAP[year]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-label-md font-semibold text-on-surface mb-1.5">
                  แท็กค้นหา (Tags คั่นด้วยเครื่องหมายจุลภาค)
                </label>
                <input
                  type="text"
                  placeholder="เช่น reg, ลงทะเบียน, ผลการเรียน"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/60 bg-surface text-on-surface text-body-sm focus:outline-none focus:border-primary-container"
                />
              </div>

              {/* Pinned Switch */}
              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-outline-variant/40 bg-surface hover:bg-surface-container/40 transition-colors">
                  <input
                    type="checkbox"
                    checked={formIsPinned}
                    onChange={(e) => setFormIsPinned(e.target.checked)}
                    className="w-5 h-5 rounded text-primary-container focus:ring-primary-container border-outline-variant"
                  />
                  <div>
                    <span className="text-label-md font-semibold text-on-surface">
                      ปักหมุดเป็นทางลัดแนะนำประจำสาขา (Pin to Top)
                    </span>
                    <p className="text-body-xs text-outline">
                      ทางลัดนี้จะแสดงในส่วนไฮไลต์ด้านบนสุดของหน้าหลักสำหรับผู้ใช้งานทุกคน
                    </p>
                  </div>
                </label>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-lg border border-outline-variant/60 bg-surface text-on-surface text-label-md hover:bg-surface-container transition-colors disabled:opacity-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-lg btn-gradient text-white text-label-md shadow-md inline-flex items-center gap-2 hover:opacity-95 transition-opacity disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      <span>กำลังบันทึก...</span>
                    </>
                  ) : (
                    <span>{editingId ? 'บันทึกการแก้ไข' : 'ลงทะเบียนทางลัด'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
            className="bg-surface-container-lowest border border-error/30 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
          >
            <div className="w-12 h-12 rounded-full bg-error-container text-on-error-container flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div className="text-center space-y-1">
              <h3 id="delete-dialog-title" className="text-title-lg font-bold text-on-surface">
                ยืนยันการลบทางลัด?
              </h3>
              <p className="text-body-sm text-outline">
                คุณกำลังจะลบรายการทางลัด <span className="font-semibold text-on-surface">&ldquo;{deletingLink.title}&rdquo;</span> การดำเนินการนี้ไม่สามารถย้อนกลับได้
              </p>

            </div>
            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setDeletingLink(null)}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-lg border border-outline-variant/60 bg-surface text-on-surface text-label-md hover:bg-surface-container transition-colors disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-lg bg-error text-on-error text-label-md shadow-md inline-flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>กำลังลบ...</span>
                  </>
                ) : (
                  <span>ยืนยันการลบ</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
