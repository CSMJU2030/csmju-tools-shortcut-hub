import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FindQuickLinksDto } from './dto/find-quick-links.dto';
import { CreateQuickLinkDto } from './dto/create-quick-link.dto';
import { UpdateQuickLinkDto } from './dto/update-quick-link.dto';
import { Prisma } from '../../generated/prisma/client';

@Injectable()
export class QuickLinksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: FindQuickLinksDto) {
    const { category, targetYear, keyword, skip, take } = query;
    
    const where: Prisma.QuickLinkWhereInput = {
      ...(category && category !== 'ALL' ? { category: category as any } : {}),
      ...(targetYear && targetYear !== 'ALL' ? { targetYears: { has: targetYear as any } } : {}),
      ...(keyword ? {
        OR: [
          { title: { contains: keyword, mode: 'insensitive' } },
          { description: { contains: keyword, mode: 'insensitive' } },
          { tags: { has: keyword } },
        ],
      } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.quickLink.findMany({
        where,
        skip,
        take,
        orderBy: [
          { isPinned: 'desc' },
          { clickCount: 'desc' },
        ],
      }),
      this.prisma.quickLink.count({ where }),
    ]);

    return { data, total };
  }

  async findOne(id: string) {
    const link = await this.prisma.quickLink.findUnique({ where: { id } });
    if (!link) {
      throw new NotFoundException('QuickLink not found');
    }
    return link;
  }

  async create(createDto: CreateQuickLinkDto) {
    return this.prisma.quickLink.create({
      data: createDto,
    });
  }

  async update(id: string, updateDto: UpdateQuickLinkDto) {
    await this.findOne(id); // Throws NotFoundException if not found
    return this.prisma.quickLink.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.quickLink.delete({
      where: { id },
    });
  }

  async trackClick(id: string) {
    await this.findOne(id);
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
