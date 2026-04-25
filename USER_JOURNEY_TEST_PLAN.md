# Estate AI - User Journey & Test Plan

> เอกสารอธิบาย User Journey และแผนการทดสอบระบบของ Estate AI (AI-Powered Property Marketplace)
> อ้างอิงจาก: Next.js 15 + Prisma + PostgreSQL + JWT Auth + Gemini AI

---

## 1. ภาพรวมระบบและ Actors

| Role | หน้าที่หลัก | สถานะ (status) |
|------|------------|----------------|
| **Guest** | เยี่ยมชม ค้นหา ดูรายละเอียดประกาศ | - |
| **User (Buyer/Renter)** | บันทึกรายการโปรด, ส่งสอบถาม, จอง, รีวิว, ชำระเงิน | `pending_verification` / `active` / `suspended` |
| **Agent** | สร้าง/แก้ไขประกาศ, จัดการ Leads, ดู Analytics | `pending_review` / `active` |
| **Admin** | อนุมัติประกาศ/Agent, จัดการผู้ใช้, ดูแลระบบ | `active` |

---

## 2. User Journey Maps

### 🗺️ Journey 1: Guest → Buyer (สมัครและค้นหาบ้าน)

```
[เปิดเว็บ] → [หน้า Home] → [ค้นหาด้วย AI] → [ดูประกาศ] → [สมัครสมาชิก]
     ↓                                              ↓
  กดชม featured                            [Login/Register]
     ↓                                              ↓
  ดู popular areas                         [Verify email]
                                                    ↓
                                          [เข้า /profile]
```

**Touchpoints:** `/`, `/search`, `/listing/[id]`, `/register`, `/login`

**Emotional State:** Curious → Engaged → Committed

---

### 🗺️ Journey 2: Buyer ค้นหาและสอบถามประกาศ

```
[Login] → [Search AI "คอนโด 3M สุขุมวิท"] → [AI ถาม clarify] → [แสดงผล]
            ↓                                                      ↓
      [Filter เพิ่ม]                                    [เลือกประกาศ]
                                                                  ↓
                          [Compare หลายรายการ] ← [Add to Favorites]
                                   ↓                              ↓
                          [นัดชมบ้าน]                    [Create Wishlist Board]
                                   ↓                              ↓
                          [ส่ง Enquiry] → [รอ Agent ติดต่อ] → [ชำระมัดจำ]
                                                                  ↓
                                                         [เขียน Review]
```

**Touchpoints:** `/search`, `/compare`, `/favorites`, `/listing/[id]`, `/enquiries`

---

### 🗺️ Journey 3: Agent สร้างและจัดการประกาศ

```
[User ธรรมดา] → [/become-agent] → [กรอกใบสมัคร + upload license]
                                              ↓
                          [Admin review /admin/agents]
                                              ↓
                              [Approved / Rejected]
                                              ↓
                               [Role เปลี่ยนเป็น agent]
                                              ↓
              [/agent/listings/new] → [กรอกข้อมูล + upload รูป]
                                              ↓
                       [Save Draft] → [Submit for Review]
                                              ↓
                          [Admin อนุมัติ / ปฏิเสธ / ขอแก้]
                                              ↓
                               [Published]
                                              ↓
              [/agent/leads] → [รับ Enquiry] → [อัปเดต status]
                                              ↓
                         [/agent/analytics] ดูยอดชม, Lead
```

**Touchpoints:** `/become-agent`, `/agent/*`, `/api/agent/listings/[id]/submit`

---

### 🗺️ Journey 4: Admin ตรวจสอบและอนุมัติ

```
[Admin Login] → [/admin dashboard] → ดูสรุปคำขอรอตรวจ
                         ↓
       ┌────────────────┼────────────────┐
       ↓                ↓                ↓
  [Listing Queue]   [Agent Apps]    [User Reports]
       ↓                ↓                ↓
  Review → Approve  Review docs    Warn/Suspend
  / Reject w/ note  Approve/Reject
       ↓                ↓                ↓
  Notification ถูกส่งให้ agent/user
                         ↓
                [Admin Action ถูก log]
```

**Touchpoints:** `/admin/*`, `/api/admin/*`

---

## 3. Test Scenarios แบบละเอียด

### ✅ TS-AUTH: Authentication

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| AUTH-01 | Register สำเร็จ | POST `/api/auth/register` ด้วย email/password ถูกต้อง | 201, สร้าง user + profile, ส่ง cookie |
| AUTH-02 | Register ด้วย email ซ้ำ | ใช้ email เดิมซ้ำ | 409 Conflict |
| AUTH-03 | Register password อ่อน | password < 8 chars | 400, Zod error |
| AUTH-04 | Login สำเร็จ | email/password ถูก | 200, access + refresh cookie |
| AUTH-05 | Login ผิด | password ผิด | 401 Unauthorized |
| AUTH-06 | Login user ถูก suspend | status = suspended | 403 Forbidden |
| AUTH-07 | Token refresh | ใช้ refresh token | ได้ access token ใหม่, rotate refresh |
| AUTH-08 | Logout | POST `/api/auth/logout` | revoke token, clear cookie |
| AUTH-09 | Forgot password | ขอ reset email | ส่ง email/token |

### ✅ TS-SEARCH: ค้นหา & AI

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| SRCH-01 | Filter basic | `/api/listings?listing_type=condo&price_max=3000000` | return listings matching |
| SRCH-02 | Filter ไม่เจอ | price ต่ำมาก | return [] + empty state |
| SRCH-03 | AI ค้นหาครั้งแรก | POST `/api/search/ai` "คอนโด 3 ล้าน" | AI อาจถาม clarify location |
| SRCH-04 | AI clarify round 2 | ตอบ "สุขุมวิท" | return matched + reasons |
| SRCH-05 | AI max 2 clarify | ถามครบ 2 รอบ | ต้องตอบผลลัพธ์ ไม่ถามต่อ |
| SRCH-06 | Save search | `/api/saved-searches` POST | บันทึก intent JSON |
| SRCH-07 | AI query ว่าง | empty string | 400 validation error |

### ✅ TS-LISTING: Listing Lifecycle

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| LIST-01 | Agent สร้าง draft | POST `/api/agent/listings` | status = `draft` |
| LIST-02 | Agent submit review | POST `/api/agent/listings/[id]/submit` | status = `pending_review` |
| LIST-03 | Submit ที่ข้อมูลขาด | ไม่มีรูป/ราคา | 400 validation |
| LIST-04 | Admin approve | POST `/api/admin/listings/[id]/review` `{action:"approve"}` | status = `published`, notify agent |
| LIST-05 | Admin reject | `{action:"reject", reason}` | status = `rejected`, notify agent with reason |
| LIST-06 | Admin request revision | `{action:"revise", notes}` | status = `revision_requested` |
| LIST-07 | Agent แก้ไขแล้ว resubmit | Edit + submit | กลับเป็น `pending_review` |
| LIST-08 | Non-agent create | User role สามัญพยายามสร้าง | 403 Forbidden |
| LIST-09 | Agent edit ประกาศคนอื่น | agent A แก้ของ agent B | 403 Forbidden |
| LIST-10 | Public ดูประกาศ draft | GET `/api/listings/[id]` status=draft | 404 Not Found |
| LIST-11 | Upload รูปเยอะ | 20+ images | ต้อง limit หรือรับได้ |
| LIST-12 | Mark sold/rented | update status | ไม่ปรากฎใน public search |

### ✅ TS-BUYER: การมีปฏิสัมพันธ์ของผู้ซื้อ

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| BUY-01 | Add favorite | POST `/api/favorites` | เพิ่ม, idempotent |
| BUY-02 | Remove favorite | DELETE | ลบออก |
| BUY-03 | Favorite guest | ไม่ login | 401 Unauthorized |
| BUY-04 | Wishlist board + item | สร้าง board → add item พร้อม note | record พร้อม note |
| BUY-05 | Compare 2-4 listings | `/compare?ids=a,b,c` | แสดงตาราง side-by-side |
| BUY-06 | Send enquiry | POST `/api/enquiries` | สร้าง enquiry, notify agent, status=`new` |
| BUY-07 | Enquiry ข้อมูลไม่ครบ | ไม่มีเบอร์ | 400 |
| BUY-08 | Appointment request | POST `/api/appointments` | status=`requested` |
| BUY-09 | Agent confirm appointment | PATCH status=`confirmed` | notify buyer |
| BUY-10 | Write review | POST `/api/reviews` rating 1-5 | บันทึก, update aggregate |
| BUY-11 | Review rating เกิน | rating = 6 | 400 validation |
| BUY-12 | Review ซ้ำของตัวเอง | โพสต์ review listing เดิมซ้ำ | block หรือ update |

### ✅ TS-PAY: ระบบชำระเงิน

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| PAY-01 | สร้าง payment card | POST `/api/payments` amount, method=card | status=pending → succeeded (mock) |
| PAY-02 | PromptPay | method=promptpay | QR/ref code + pending |
| PAY-03 | Fail payment | provider decline | status=failed, no side effect |
| PAY-04 | Amount ≤ 0 | amount=0 | 400 validation |
| PAY-05 | ชำระประกาศที่ไม่มี | listingId ไม่มีอยู่ | 404 |
| PAY-06 | Purpose ผิด | purpose=random | 400 |
| PAY-07 | List payments ตัวเอง | GET `/api/payments` | เฉพาะของ user นั้น |

### ✅ TS-AGENT: การจัดการของ Agent

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| AG-01 | สมัคร Agent | POST `/api/agent/apply` + license | app status=`pending_review` |
| AG-02 | Admin อนุมัติ Agent | approve application | user.role = `agent`, notify |
| AG-03 | Admin reject | reject with note | status=`rejected`, notify |
| AG-04 | Admin ขอข้อมูลเพิ่ม | `info_requested` | user แก้ไข + resubmit |
| AG-05 | ดู Leads | GET `/api/agent/leads` | list enquiries ของ agent |
| AG-06 | Update Lead status | new→contacted→viewing→negotiating→won | เปลี่ยนตาม flow |
| AG-07 | Invalid status jump | won → new | 400 |
| AG-08 | Analytics dashboard | GET `/api/agent/analytics` | views, leads, conversion |

### ✅ TS-ADMIN: การจัดการของ Admin

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| ADM-01 | Dashboard overview | GET `/admin` | summary counts |
| ADM-02 | Listing queue | GET `/api/admin/listings/queue` | ประกาศ pending_review |
| ADM-03 | Agent applications | GET `/api/admin/agents/applications` | รายการสมัคร |
| ADM-04 | Suspend user | PATCH `/api/admin/users/[id]` status=suspended | ผู้ใช้ login ไม่ได้ |
| ADM-05 | Unsuspend | status=active | กลับมาใช้งานได้ |
| ADM-06 | Admin action log | ทุก action | บันทึก AdminAction |
| ADM-07 | Non-admin เข้า admin | user role=user | 403 redirect to / |

### ✅ TS-SEC: Security & Edge Cases

| ID | Scenario | Expected |
|----|----------|----------|
| SEC-01 | SQL injection ใน search query | Prisma escape, ไม่ error |
| SEC-02 | XSS ในรีวิว `<script>` | escape, ไม่ execute |
| SEC-03 | CSRF ใน POST | ต้อง token/same-origin check |
| SEC-04 | Rate limit login | 10 ครั้งผิด → block |
| SEC-05 | Unauthorized API | ไม่มี token → 401 |
| SEC-06 | IDOR favorite/enquiry | แก้ของคนอื่น → 403 |
| SEC-07 | Upload ไฟล์อันตราย | .exe, script → reject |
| SEC-08 | JWT หมดอายุ | → force refresh หรือ logout |

### ✅ TS-UI: UI/UX Testing

| ID | Scenario | Expected |
|----|----------|----------|
| UI-01 | Responsive mobile | ทุกหน้าแสดงได้บน 375px |
| UI-02 | Tablet 768px | layout ปรับเหมาะสม |
| UI-03 | Dark mode (ถ้ามี) | สีถูกต้อง |
| UI-04 | Form validation error | แสดง error ใต้ field |
| UI-05 | Loading state | แสดง skeleton/spinner |
| UI-06 | Empty state | หน้าว่างมี illustration + CTA |
| UI-07 | Offline mode | redirect `/offline` |
| UI-08 | Map ใน listing | Leaflet แสดง marker ถูกตำแหน่ง |
| UI-09 | Image gallery | คลิกซูม, swipe |
| UI-10 | Accessibility | keyboard nav, aria labels |

---

## 4. End-to-End Scenarios (Happy Path)

### 🎯 E2E-01: Complete Buyer Flow
```
1. เข้า / (landing)
2. กด "Search AI" พิมพ์ "คอนโด 2 ห้องนอน สุขุมวิท 5M"
3. AI ถาม clarify ("ต้องการใกล้ BTS ไหม?") → ตอบ
4. ได้ผลลัพธ์ 5 รายการ
5. Register (email + password)
6. Login
7. Add 3 listings to Favorites
8. Create Wishlist Board "พิจารณา Q2"
9. เลือก 1 ประกาศ → ส่ง Enquiry
10. Agent ตอบกลับ → นัดชม
11. ชำระมัดจำ via PromptPay
12. เขียน Review 5 ดาว
```

### 🎯 E2E-02: Complete Agent Flow
```
1. User Register
2. /become-agent → Upload license + info
3. Admin approve
4. Role เป็น agent
5. Create listing (draft) + อัพโหลด 10 รูป
6. Submit for review
7. Admin ขอแก้ไข (revision) → ปรับราคา
8. Resubmit → Admin approve
9. ประกาศ live
10. รับ Enquiry → update status เป็น contacted → viewing → won
11. ดู Analytics
```

### 🎯 E2E-03: Admin Full Moderation
```
1. Admin Login
2. ดู Dashboard (5 listings pending, 2 agents pending)
3. Review agent application #1 → approve
4. Review agent application #2 → reject with reason
5. Review 5 listings: approve 3, reject 1, request revision 1
6. ดู user report spam → suspend user
7. ดู AdminAction log ครบ
```

---

## 5. Test Data เตรียม

```
Users:
- buyer1@test.com / Test1234! (active)
- buyer2@test.com / Test1234! (active)
- agent1@test.com / Test1234! (agent, approved)
- admin@test.com / Test1234! (admin)
- suspended@test.com (status=suspended)

Listings:
- 10x published (various price/type/location)
- 3x pending_review
- 2x draft (ของ agent1)
- 1x rejected

Payments: mock provider = "mock" → succeed 100%
```

---

## 6. Test Tools แนะนำ

| Layer | Tool |
|-------|------|
| Unit (Zod schemas, utils) | Jest / Vitest |
| API integration | Supertest + Prisma test DB |
| E2E UI | Playwright |
| Load | k6 / Artillery |
| Security | OWASP ZAP, Burp |

---

## 7. Acceptance Criteria สรุป

✅ ทุก API endpoint auth ถูกต้อง (401/403 เมื่อไม่มีสิทธิ์)
✅ Listing lifecycle ผ่าน state machine ครบ
✅ AI search ไม่ถาม clarify เกิน 2 รอบ
✅ Payment ไม่ double-charge
✅ Admin action ถูก log ทุกครั้ง
✅ Notification ส่งถูก user/agent
✅ UI responsive 375px – 1920px
✅ Performance: Landing < 3s, Search results < 2s
