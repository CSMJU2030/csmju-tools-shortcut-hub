import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, LinkCategory, TargetYear, RequestStatus } from '../generated/prisma/client';

let connectionString = process.env.DATABASE_URL;
if (connectionString && connectionString.includes('${')) {
  const user = process.env.POSTGRES_USER || 'postgres';
  const password = process.env.POSTGRES_PASSWORD || '';
  connectionString = connectionString
    .replace('${POSTGRES_USER}', user)
    .replace('${POSTGRES_PASSWORD}', password);
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({ adapter });

async function main(): Promise<void> {
  console.log('[seed] seeding csmju_tools_shortcut_hub ...');

  const links = [
    {
      title: 'ระบบลงทะเบียนเรียน (REG MJU)',
      description: 'ระบบลงทะเบียน ตรวจสอบตารางเรียน และผลการเรียน มหาวิทยาลัยแม่โจ้',
      url: 'https://reg.mju.ac.th',
      category: LinkCategory.ACADEMIC,
      targetYears: [TargetYear.ALL],
      tags: ['ลงทะเบียน', 'ตารางเรียน', 'เกรด', 'REG'],
      iconName: 'GraduationCap',
      isPinned: true,
      clickCount: 1250,
    },
    {
      title: 'MJU e-Learning (LMS)',
      description: 'ระบบจัดการการเรียนการสอนออนไลน์ สำหรับส่งงานและดูเอกสารรายวิชา',
      url: 'https://e-learning.mju.ac.th',
      category: LinkCategory.ACADEMIC,
      targetYears: [TargetYear.ALL],
      tags: ['e-Learning', 'ส่งงาน', 'เอกสารการเรียน'],
      iconName: 'BookOpen',
      isPinned: true,
      clickCount: 980,
    },
    {
      title: 'GitHub Education Pack',
      description: 'รับสิทธิ์ใช้เครื่องมือ Dev สิทธิพิเศษฟรีสำหรับนักศึกษา เช่น Copilot, Domain',
      url: 'https://education.github.com/pack',
      category: LinkCategory.DEV_TOOLS,
      targetYears: [TargetYear.ALL],
      tags: ['GitHub', 'Developer Tools', 'Free Pack', 'Git'],
      iconName: 'Code',
      isPinned: true,
      clickCount: 640,
    },
  ];

  for (const link of links) {
    // Check if link exists by URL since URL should be unique conceptually, 
    // but we didn't mark it unique in schema. Let's just create them for seed.
    const existing = await prisma.quickLink.findFirst({ where: { url: link.url } });
    if (!existing) {
      await prisma.quickLink.create({ data: link });
    }
  }

  const count = await prisma.quickLink.count();
  console.log(`[seed] done: ${count} quick links`);
}

main()
  .catch((error) => {
    console.error('[seed] failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
