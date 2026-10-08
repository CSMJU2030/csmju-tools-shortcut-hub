// types/quick-link.type.ts

export type LinkCategory = 
  | 'ACADEMIC'      // ระบบการเรียน/ลงทะเบียน (Reg, LMS)
  | 'DEV_TOOLS'     // เครื่องมือพัฒนา/การเขียนโค้ด (IDE, Cloud, Compiler)
  | 'FACULTY_INFO'  // ข้อมูลสาขา/มหาวิทยาลัย (หลักสูตร, แผนที่)
  | 'COMMUNITY'     // ช่องทางติดต่อ/ชุมชน (Discord, Line, FB Group)
  | 'OTHER';        // อื่นๆ

export type TargetYear = 'ALL' | 'YEAR_1' | 'YEAR_2' | 'YEAR_3' | 'YEAR_4';

export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

// ข้อมูลรายการลิงก์
export interface QuickLink {
  id: string;
  title: string;
  description: string;
  url: string;
  category: LinkCategory;
  targetYears: TargetYear[];
  tags: string[];
  iconName?: string;
  isPinned: boolean;       // ลิงก์ปักหมุดประจำสาขา
  clickCount: number;      // จำนวนการคลิกใช้งาน
  createdAt: string;
  updatedAt: string;
}

// ข้อมูลคำขอแนะนำลิงก์ใหม่ (จากนักศึกษา/อาจารย์)
export interface LinkRequest {
  id: string;
  title: string;
  description: string;
  url: string;
  category: LinkCategory;
  targetYears: TargetYear[];
  tags: string[];
  coreUserId: string;
  personCode?: string | null;
  status: RequestStatus;
  rejectionReason?: string;
  createdAt: string;
}

// ข้อมูลการแจ้งรายงานลิงก์เสีย
export interface BrokenLinkReport {
  id: string;
  linkId: string;
  linkTitle: string;
  reportedByCoreUserId?: string;
  details: string;
  isResolved: boolean;
  createdAt: string;
}

// DTO สำหรับการค้นหาและ Filter
export interface LinkFilterQuery {
  keyword?: string;
  category?: LinkCategory | 'ALL';
  targetYear?: TargetYear;
}

// Input สำหรับสร้างทางลัดใหม่
export interface CreateQuickLinkInput {
  title: string;
  description?: string;
  url: string;
  category?: LinkCategory;
  targetYears?: TargetYear[];
  tags?: string[];
  iconName?: string;
  isPinned?: boolean;
}

// Input สำหรับแก้ไขทางลัด
export type UpdateQuickLinkInput = Partial<CreateQuickLinkInput>;