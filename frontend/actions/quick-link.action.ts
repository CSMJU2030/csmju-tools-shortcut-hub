'use server';

import { QuickLink, LinkFilterQuery } from '@/types/quick-link.type';

// Base URL for the NestJS backend
const BACKEND_URL = process.env.BACKEND_URL ?? 'http://127.0.0.1:4238';
const API_URL = process.env.API_URL || `${BACKEND_URL}/api/v1`;

export async function getQuickLinks(query?: LinkFilterQuery): Promise<QuickLink[]> {
  try {
    const params = new URLSearchParams();
    if (query?.keyword) params.append('keyword', query.keyword);
    if (query?.category && query.category !== 'ALL') params.append('category', query.category);
    if (query?.targetYear && query.targetYear !== 'ALL') params.append('targetYear', query.targetYear);

    const res = await fetch(`${API_URL}/quick-links?${params.toString()}`, {
      cache: 'no-store', // Always fetch fresh data
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch quick links: ${res.status}`);
    }

    const { success, data } = await res.json();
    return success ? data : [];
  } catch (error) {
    console.error('Error fetching quick links:', error);
    throw new Error('Failed to fetch quick links');
  }
}

export async function getPinnedQuickLinks(): Promise<QuickLink[]> {
  try {
    const res = await fetch(`${API_URL}/quick-links`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch pinned links: ${res.status}`);
    }

    const { success, data } = await res.json();
    return success ? data.filter((link: QuickLink) => link.isPinned) : [];
  } catch (error) {
    console.error('Error fetching pinned quick links:', error);
    throw new Error('Failed to fetch pinned links');
  }
}

export async function trackLinkClick(linkId: string): Promise<{ success: boolean }> {
  try {
    const res = await fetch(`${API_URL}/quick-links/${linkId}/click`, {
      method: 'POST',
      cache: 'no-store',
    });

    if (!res.ok) {
      return { success: false };
    }

    const json = await res.json();
    return { success: json.success };
  } catch (error) {
    console.error('Error tracking link click:', error);
    return { success: false };
  }
}

/**
 * Server action to create a new quick link.
 * If unauthorized (401), redirects to /signin-again (auth-contract 7).
 */
export async function createQuickLinkAction(formData: FormData) {
  const { redirect } = await import('next/navigation');
  const { call } = await import('@/lib/api');

  const title = String(formData.get('title') ?? '').trim();
  const url = String(formData.get('url') ?? '').trim();
  const category = String(formData.get('category') ?? 'OTHER');

  const res = await call('/api/v1/quick-links', {
    method: 'POST',
    body: { title, url, category },
  });

  if (!res.ok && res.status === 401) {
    const page = `/admin/quick-links?${new URLSearchParams({ error: 'การเข้าสู่ระบบหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง' })}`;
    redirect(`/signin-again?${new URLSearchParams({ next: page })}`);
  }

  if (res.ok) {
    redirect('/admin/quick-links?ok=' + encodeURIComponent('เพิ่มทางลัดสำเร็จ'));
  } else {
    redirect(`/admin/quick-links?error=${encodeURIComponent(res.message)}`);
  }
}