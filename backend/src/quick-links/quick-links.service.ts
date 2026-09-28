import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuickLinksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: any = {}) {
    const { category, targetYear, keyword } = query;
    
    return this.prisma.quickLink.findMany({
      where: {
        ...(category && category !== 'ALL' ? { category } : {}),
        ...(targetYear && targetYear !== 'ALL' ? { targetYears: { has: targetYear } } : {}),
        ...(keyword ? {
          OR: [
            { title: { contains: keyword, mode: 'insensitive' } },
            { description: { contains: keyword, mode: 'insensitive' } },
            { tags: { has: keyword } },
          ],
        } : {}),
      },
      orderBy: [
        { isPinned: 'desc' },
        { clickCount: 'desc' },
      ],
    });
  }

  async trackClick(id: string) {
    return this.prisma.quickLink.update({
      where: { id },
      data: {
        clickCount: {
          increment: 1,
        },
      },
    });
  }
}
