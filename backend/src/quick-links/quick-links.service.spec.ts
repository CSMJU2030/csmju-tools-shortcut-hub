import { Test, TestingModule } from '@nestjs/testing';
import { QuickLinksService } from './quick-links.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { FindQuickLinksDto } from './dto/find-quick-links.dto';
import { LinkCategory } from '../../generated/prisma/client';

describe('QuickLinksService', () => {
  let service: QuickLinksService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuickLinksService,
        {
          provide: PrismaService,
          useValue: {
            quickLink: {
              findMany: jest.fn(),
              count: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<QuickLinksService>(QuickLinksService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('returns data and total for pagination', async () => {
      const mockData = [{ id: '1', title: 'Test', url: 'https://test.com' }];
      jest.spyOn(prisma.quickLink, 'findMany').mockResolvedValue(mockData as any);
      jest.spyOn(prisma.quickLink, 'count').mockResolvedValue(1);

      const query = new FindQuickLinksDto();
      query.page = 1;
      query.limit = 10;
      const result = await service.findAll(query);
      expect(result.data).toEqual(mockData);
      expect(result.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('returns the quick link if found', async () => {
      const mockData = { id: '1', title: 'Test' };
      jest.spyOn(prisma.quickLink, 'findUnique').mockResolvedValue(mockData as any);

      const result = await service.findOne('1');
      expect(result).toEqual(mockData);
    });

    it('throws NotFoundException if not found', async () => {
      jest.spyOn(prisma.quickLink, 'findUnique').mockResolvedValue(null);
      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('creates a new quick link', async () => {
      const mockData = { id: '1', title: 'Test' };
      jest.spyOn(prisma.quickLink, 'create').mockResolvedValue(mockData as any);
      
      const result = await service.create({ title: 'Test', url: 'https://test.com', category: LinkCategory.OTHER });
      expect(result).toEqual(mockData);
    });
  });

  describe('update', () => {
    it('updates a quick link', async () => {
      const mockData = { id: '1', title: 'Updated' };
      jest.spyOn(prisma.quickLink, 'findUnique').mockResolvedValue(mockData as any);
      jest.spyOn(prisma.quickLink, 'update').mockResolvedValue(mockData as any);
      
      const result = await service.update('1', { title: 'Updated' });
      expect(result).toEqual(mockData);
    });
  });

  describe('delete', () => {
    it('deletes a quick link', async () => {
      const mockData = { id: '1', title: 'Deleted' };
      jest.spyOn(prisma.quickLink, 'findUnique').mockResolvedValue(mockData as any);
      jest.spyOn(prisma.quickLink, 'delete').mockResolvedValue(mockData as any);
      
      const result = await service.remove('1');
      expect(result).toEqual(mockData);
    });
  });
});
