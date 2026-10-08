'use server';

import { revalidatePath } from 'next/cache';
import { QuickLink, LinkFilterQuery, CreateQuickLinkInput, UpdateQuickLinkInput, TargetYear } from '@/types/quick-link.type';
import { call } from '@/lib/api';

// Base URL for the NestJS backend
const BACKEND_URL = process.env.BACKEND_URL ?? 'http://127.0.0.1:4238';
const API_URL = process.env.API_URL || `${BACKEND_URL}/api/v1`;

export async function getQuickLinks(query?: LinkFilterQuery & { limit?: number; page?: number }): Promise<QuickLink[]> {
  try {
    const params = new URLSearchParams();
    if (query?.keyword) params.append('keyword', query.keyword);
    if (query?.category && query.category !== 'ALL') params.append('category', query.category);
    if (query?.targetYear && query.targetYear !== 'ALL') params.append('targetYear', query.targetYear);
    if (query?.limit) params.append('limit', String(query.limit));
    if (query?.page) params.append('page', String(query.page));

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
    const res = await fetch(`${API_URL}/quick-links?limit=100`, {
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
 * Supports both JSON payload and FormData.
 */
export async function createQuickLinkAction(
  payload: CreateQuickLinkInput | FormData,
): Promise<{ ok: boolean; message?: string; data?: QuickLink }> {
  let body: CreateQuickLinkInput;

  if (payload instanceof FormData) {
    const title = String(payload.get('title') ?? '').trim();
    const url = String(payload.get('url') ?? '').trim();
    const description = String(payload.get('description') ?? '').trim();
    const category = (payload.get('category') as CreateQuickLinkInput['category']) || 'OTHER';
    const rawTargetYears = payload.getAll('targetYears');
    const targetYears: TargetYear[] =
      rawTargetYears.length > 0 ? (rawTargetYears.map((y) => String(y)) as TargetYear[]) : ['ALL'];
    const tagsString = String(payload.get('tags') ?? '').trim();
    const tags = tagsString ? tagsString.split(',').map((t) => t.trim()).filter(Boolean) : [];
    const isPinned = payload.get('isPinned') === 'true' || payload.get('isPinned') === 'on';

    body = {
      title,
      url,
      description: description || undefined,
      category,
      targetYears,
      tags,
      isPinned,
    };
  } else {
    body = payload;
  }

  const res = await call<QuickLink>('/api/v1/quick-links', {
    method: 'POST',
    body,
  });

  if (res.ok) {
    revalidatePath('/quick-links');
    revalidatePath('/admin/quick-links');
    return { ok: true, data: res.data };
  }

  return { ok: false, message: res.message };
}

/**
 * Server action to update an existing quick link.
 */
export async function updateQuickLinkAction(
  id: string,
  input: UpdateQuickLinkInput,
): Promise<{ ok: boolean; message?: string; data?: QuickLink }> {
  const res = await call<QuickLink>(`/api/v1/quick-links/${id}`, {
    method: 'PATCH',
    body: input,
  });

  if (res.ok) {
    revalidatePath('/quick-links');
    revalidatePath('/admin/quick-links');
    return { ok: true, data: res.data };
  }

  return { ok: false, message: res.message };
}

/**
 * Server action to delete a quick link.
 */
export async function deleteQuickLinkAction(
  id: string,
): Promise<{ ok: boolean; message?: string }> {
  const { getMe } = await import('@/lib/api');
  const me = await getMe();
  if (!me.ok || me.data.subsystemRole !== 'ADMIN') {
    return { ok: false, message: 'สิทธิ์ไม่เพียงพอ: เฉพาะผู้ดูแลระบบ (ADMIN) เท่านั้นที่สามารถลบรายการทางลัดได้' };
  }

  const res = await call<{ id: string }>(`/api/v1/quick-links/${id}`, {
    method: 'DELETE',
  });

  if (res.ok) {
    revalidatePath('/quick-links');
    revalidatePath('/admin/quick-links');
    return { ok: true };
  }

  return { ok: false, message: res.message };
}


/**
 * Server action to toggle pinned status of a quick link.
 */
export async function togglePinQuickLinkAction(
  id: string,
  isPinned: boolean,
): Promise<{ ok: boolean; message?: string }> {
  return updateQuickLinkAction(id, { isPinned });
}
