'use server';

import { QuickLink, LinkFilterQuery } from '@/types/quick-link.type';

// Base URL for the NestJS backend
const API_URL = process.env.API_URL || 'http://localhost:3002/api';

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
    return [];
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
    return [];
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