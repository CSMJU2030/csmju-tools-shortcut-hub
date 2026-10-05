# CSMJU Tools Shortcut Hub

ระบบรวมลิงก์สำคัญ (Tools Shortcut Hub) สำหรับนักศึกษาคณะวิทยาการคอมพิวเตอร์ มหาวิทยาลัยแม่โจ้ (CSMJU)

## การติดตั้งและการรัน (สำหรับนักพัฒนา)

1. **ติดตั้ง Dependencies:**
   ```bash
   pnpm install
   ```
2. **สร้างฐานข้อมูลและ Seed ข้อมูลตัวอย่าง:**
   ```bash
   pnpm --filter backend prisma:migrate
   pnpm --filter backend prisma:seed
   ```
3. **รันระบบ (ทั้ง Frontend และ Backend):**
   ```bash
   pnpm dev:all
   ```
   > ระบบ Frontend รันที่พอร์ต `3238` และ Backend API รันที่พอร์ต `4238`

## การทดสอบ

- รัน Unit Test:
  ```bash
  pnpm test
  ```
- ตรวจสอบมาตรฐานด้วย Conformance:
  ```bash
  pnpm conformance
  ```
- ตรวจสอบความถูกต้องทั้งหมดก่อนเปิด PR (Lint, Typecheck, Build, Test):
  ```bash
  pnpm checks
  ```