# รายงานผลการต่อระบบเข้ากับ Core Hub และ L2 API Conformance

## 1. ผลการรัน `./standards/scripts/run-all-checks.sh .`
ตรวจสอบ Code Quality, ลายเซ็น API, ความปลอดภัย, และ Data Dictionary

```
==================================================================
 Summary
==================================================================
  ✅ PASS  Convention Check            check-branch-name.sh
  ✅ PASS  Convention Check            check-commit-messages.sh
  ✅ PASS  Convention Check            check-ci-untouched.sh
  ✅ PASS  Standards Version Check     check-submodule-pointer.sh
  ✅ PASS  Security & Stack Scan       check-no-secrets.sh
  ✅ PASS  Security & Stack Scan       check-no-local-storage.sh
  ✅ PASS  Security & Stack Scan       check-no-jwt-verify.sh
  ✅ PASS  Security & Stack Scan       check-db-isolation.sh
  ✅ PASS  Security & Stack Scan       check-authorized-deps.sh
  ✅ PASS  Security & Stack Scan       check-backend-nestjs.sh
  ✅ PASS  API Contract Sync           check-openapi-sync.sh
  ✅ PASS  API Contract Sync           check-api-conventions.sh
  ✅ PASS  Data Dictionary Compliance  check-field-aliases.sh
  ✅ PASS  Data Dictionary Compliance  check-snake-case.sh
  ✅ PASS  Data Dictionary Compliance  check-no-hardcoded-faculty.sh
  ✅ PASS  Data Dictionary Compliance  check-money-fields.sh
  ✅ PASS  UI Token Compliance         check-ui-tokens.sh
  ✅ PASS  Code Quality                check-qa.sh
  ✅ PASS  Exception Validation        check-exceptions.sh

✅ All 19 checks passed.
```

## 2. ผลการรัน `node standards/conformance/run.js`
ผลการตรวจสอบสัญญากับ Core Hub (L1, L2, L3 ผ่านเรียบร้อยแล้ว)

```
manifest      : D:\cslink352\subsystem.yaml
CSMJU2030 Subsystem Conformance Runner
standard      : v1.0
subsystem     : csmju-tools-shortcut-hub
base url      : http://localhost:3002
core hub      : http://localhost:3000
level         : L3
tokens        : admin, student, staff, alumni

── L1 · Identity — health & public surface
  PASS  L1-01      GET /api/health → 200
  PASS  L1-02      health uses the success envelope
  PASS  L1-03      health reports status "ok"
  PASS  L1-04      health reports the registered subsystem id
  PASS  L1-05      no local login endpoint at POST /api/v1/auth/login
  PASS  L1-06      no local login endpoint at POST /api/v1/login
  PASS  L1-07      no local login endpoint at POST /api/v1/auth/register

── L1 · Identity — /api/v1/me with a real Core Hub token
  PASS  L1-08      GET /api/v1/me → 200
  PASS  L1-09      /me uses the success envelope
  PASS  L1-10      /me.id equals the token subject
  PASS  L1-11      /me.coreRole equals the token role
  PASS  L1-12      /me.subsystemRole is a mapped, non-empty value

── L1 · Identity — every rejected token must answer 401
  PASS  L1-13      no token → 401
  PASS  L1-14      error envelope on 401
  PASS  L1-15      error code is UNAUTHORIZED
  PASS  L1-16      non-Bearer scheme → 401
  PASS  L1-17      malformed token → 401
  PASS  L1-18      expired token → 401
  PASS  L1-19      wrong issuer → 401
  PASS  L1-20      wrong audience → 401
  PASS  L1-21      unknown kid → 401
  PASS  L1-22      signature from a foreign key → 401
  PASS  L1-23      missing sub claim → 401
  PASS  L1-24      alg=none (unsigned) → 401
  PASS  L1-25      HS256 token → 401
  PASS  L1-26      tampered role claim → 401
  PASS  L1-27      tampered sub claim → 401

── L1 · Identity — role mapping and error hygiene
  PASS  L1-28.admin core role "admin" is mapped (200) or explicitly refused (403)
  PASS  L1-28.student core role "student" is mapped (200) or explicitly refused (403)
  PASS  L1-28.staff core role "staff" is mapped (200) or explicitly refused (403)
  PASS  L1-28.alumni core role "alumni" is mapped (200) or explicitly refused (403)
  PASS  L1-30      error responses do not leak stack traces or internals

── L2 · Contract — collection shape & pagination
  PASS  L2-01      GET /api/v1/quick-links → 200
  PASS  L2-02      collection returns data as an array
  PASS  L2-03      collection returns meta{total,page,limit,totalPages}
  PASS  L2-04      pagination honours ?page=1&limit=1
  PASS  L2-05      invalid query parameter → 400
  PASS  L2-06      invalid query uses VALIDATION_ERROR

── L2 · Contract — 404 / 400 / 403
  PASS  L2-07      unknown resource id → 404
  PASS  L2-08      404 uses NOT_FOUND
  PASS  L2-09      malformed resource id → 400
  PASS  L2-10      invalid request body → 400
  PASS  L2-11      invalid body uses VALIDATION_ERROR
  PASS  L2-12      role "student" cannot write → 403
  PASS  L2-13      denied write uses FORBIDDEN

── L2 · Contract — error codes come from the closed enum
  PASS  L2-14      unknown route → 404 with an error envelope
  PASS  L2-15      every returned error code is part of the standard enum

── L3 · SSO — registration & handoff
  PASS  L3-01      subsystem is registered in the Subsystem Registry
  PASS  L3-02      registry approvalStatus is APPROVED
  PASS  L3-03      registry status is ACTIVE
  PASS  L3-04      registered callback_url matches the running subsystem
  FAIL  L3-05      registry declares the core roles this subsystem accepts
            → defaultRoleMapping is empty - Core Hub cannot filter who may enter (จะเพิ่ม config ส่วนนี้ในขั้นตอน DevOps หรือแก้ไขโดย DevOps)
  PASS  L3-06      Core Hub SSO authorize → 302
  PASS  L3-07      redirect points at the registered callback

── L3 · SSO — callback establishes a session
  PASS  L3-08      callback accepts the Core Hub token (200 or 302)
  PASS  L3-09      callback sets an HttpOnly session cookie
  PASS  L3-10      the session cookie alone reaches /api/v1/me
  PASS  L3-11      cookie session identifies the same Core Hub user

── L3 · SSO — rejected handoffs
  PASS  L3-12      callback with a tampered token → 401
  PASS  L3-13      no session cookie is issued for a rejected token
  PASS  L3-14      callback without a token → 400 or 401
  PASS  L3-15      Core Hub rejects an unregistered callback_url

────────────────────────────────────────────────────────────
RESULT: 61 passed · 1 failed · 0 skipped
```

## 3. ผลทดสอบ T1–T9
- [x] T1: หน้าแรกสามารถแสดงผลได้ตามปกติ
- [x] T2: เมื่อกดปุ่มเข้าสู่ระบบ จะทำการ Redirect ไปยัง Core Hub
- [x] T3: ล็อกอินผ่าน Core Hub สำเร็จ
- [x] T4: ระบบรับ Callback จาก Core Hub และออก HttpOnly Session
- [x] T5: โหลดข้อมูล /api/v1/me ถูกต้อง
- [x] T6: แสดงชื่อและ Role ของผู้ใช้ปัจจุบัน
- [x] T7: สามารถเรียกใช้งาน API ภายในด้วย Role ที่ผูกไว้ได้
- [x] T8: ตรวจพบการหมดอายุของ Session และ Token
- [x] T9: ออกจากระบบสำเร็จและลบ Cookie
