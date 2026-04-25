# Estate AI — Test Cases

ครอบคลุมทุก process ของเว็บไซต์ — แบ่งตาม role และ flow

**Test accounts (จาก seed):**
- User: `user@estate.app` / `password123`
- Agent: `agent@estate.app` / `password123`
- Admin: `admin@estate.app` / `password123`

---

## 1. Auth & Account

### 1.1 Register
| # | Steps | Expected | API |
|---|---|---|---|
| 1.1.1 | สมัครด้วยอีเมลใหม่ + รหัสผ่าน 8+ ตัว | สร้างบัญชีสำเร็จ → redirect /login | `POST /api/auth/register` |
| 1.1.2 | สมัครด้วยอีเมลซ้ำ | error "อีเมลนี้มีในระบบ" | 400 |
| 1.1.3 | รหัสผ่านสั้น < 8 ตัว | error validation | 400 |

### 1.2 Login
| # | Steps | Expected |
|---|---|---|
| 1.2.1 | login ด้วย credentials ถูก | redirect เข้า dashboard role-based, navbar แสดงชื่อ |
| 1.2.2 | login ด้วยรหัสผิด | error "อีเมลหรือรหัสผ่านไม่ถูกต้อง" |
| 1.2.3 | login เสร็จ refresh page | session persist (cookie) |

### 1.3 Logout
| # | Steps | Expected |
|---|---|---|
| 1.3.1 | คลิก logout ในเมนู navbar | clear cookies, redirect / |

### 1.4 Profile (`/profile`)
| # | Steps | Expected |
|---|---|---|
| 1.4.1 | เปิด /profile โดย login แล้ว | input ชื่อ/นามสกุล/เบอร์ pre-fill จาก session, email disabled |
| 1.4.2 | แก้ชื่อ → กดบันทึก | toast "บันทึกแล้ว", refresh page → ค่าใหม่ค้าง, navbar avatar tooltip เปลี่ยน |
| 1.4.3 | แก้เบอร์เป็น "abc" | error validation |
| 1.4.4 | แก้เบอร์เป็นเว้นว่าง | บันทึกได้ (set null) |
| 1.4.5 | กด Camera/เปลี่ยนรูป → เลือก JPG ≤ 2 MB | toast loading → แสดงรูปทันที, sidebar/navbar avatar เปลี่ยน |
| 1.4.6 | upload .gif หรือ .pdf | error "รองรับเฉพาะ JPG, PNG, WebP" |
| 1.4.7 | upload > 2 MB | error "ขนาดไฟล์เกิน 2 MB" |
| 1.4.8 | upload ขณะ logout | redirect /login |

### 1.5 Change Password
| # | Steps | Expected |
|---|---|---|
| 1.5.1 | กรอกรหัสปัจจุบันถูก + รหัสใหม่ ≥ 8 ตัว + ยืนยันตรง | toast "เปลี่ยนรหัสผ่านแล้ว", logout other sessions (refresh tokens ลบ) |
| 1.5.2 | รหัสปัจจุบันผิด | error "รหัสผ่านปัจจุบันไม่ถูกต้อง" |
| 1.5.3 | ยืนยันไม่ตรงรหัสใหม่ | error "ยืนยันรหัสไม่ตรง" |
| 1.5.4 | รหัสใหม่ซ้ำกับเดิม | error "รหัสผ่านใหม่ต้องไม่ซ้ำกับเดิม" |
| 1.5.5 | รหัสใหม่ < 8 ตัว | error validation |

### 1.6 Notifications
| # | Steps | Expected |
|---|---|---|
| 1.6.1 | bell ใน navbar ขณะ logout | ไม่แสดง |
| 1.6.2 | bell ขณะ login + มี notification ใหม่ | badge แสดง count |
| 1.6.3 | คลิก bell | dropdown แสดงรายการล่าสุด 5 |
| 1.6.4 | คลิก notification | mark read, navigate ไปตาม link |
| 1.6.5 | คลิก "อ่านทั้งหมด" | ทุกตัวเป็น read |
| 1.6.6 | ไม่มีลิงก์ "Notifications" ใน sidebar /profile | ✅ ลบแล้ว (entry หลักคือ bell) |

---

## 2. Search & Discovery

### 2.1 AI Search
| # | Steps | Expected |
|---|---|---|
| 2.1.1 | พิมพ์ "คอนโดใกล้ BTS ไม่เกิน 5 ล้าน" → enter | redirect /search?q=..., AI parse intent → แสดง chips, listings ตรงเงื่อนไข |
| 2.1.2 | query กำกวม | AI ขอ clarification (quick replies) |
| 2.1.3 | query ไม่มีผล | "ไม่พบทรัพย์ที่ตรงกับเงื่อนไข" |

### 2.2 Filter & Sort
| # | Steps | Expected |
|---|---|---|
| 2.2.1 | เลือก property type "คอนโด" | URL เพิ่ม `property_types=condo`, results filter |
| 2.2.2 | สลับ view grid/list/map | render ต่างกัน, listings consistent |
| 2.2.3 | sort "ราคาต่ำสุด" | ลำดับเรียงราคาน้อย→มาก |

### 2.3 Compare (เพิ่งแก้)
| # | Steps | Expected |
|---|---|---|
| 2.3.1 | คลิก ⚖️ ที่การ์ด → tray ด้านล่างขึ้น "1/4" | ✅ tray เดียว (global) |
| 2.3.2 | เลือก 2+ ทรัพย์ → "ไปเปรียบเทียบ" | redirect /compare?ids=... แสดงตาราง side-by-side |
| 2.3.3 | คลิก ⚖️ ในหน้า detail → กลับมา /search | tray ยังคงค่าเดิม (sync ผ่าน global store + localStorage) |
| 2.3.4 | refresh page | tray ฟื้นจาก localStorage |
| 2.3.5 | เลือก > 4 รายการ | ปุ่ม disabled, tooltip "เปรียบเทียบเต็มแล้ว" |

---

## 3. Listing Detail

### 3.1 Gallery
| # | Steps | Expected |
|---|---|---|
| 3.1.1 | คลิกรูปย่อย | active เปลี่ยน, รูปใหญ่เปลี่ยน |
| 3.1.2 | คลิก "ดูทั้งหมด N รูป" | lightbox เปิด |
| 3.1.3 | กด ⚖️ บนปุ่ม | toggle เข้า/ออก compare store |
| 3.1.4 | กด ❤️ ขณะ logout | redirect /login |

### 3.2 Save to Board (เพิ่งแก้)
| # | Steps | Expected |
|---|---|---|
| 3.2.1 | คลิก 🔖 บนการ์ด | modal เปิดกลางจอ (portal to body) — ✅ ไม่กระพริบ |
| 3.2.2 | คลิกบอร์ด | item เพิ่มเข้า, badge "บันทึกแล้ว" เขียว |
| 3.2.3 | คลิก "สร้างบอร์ดใหม่" → ใส่ชื่อ → "สร้างและบันทึก" | board ใหม่ + auto-save listing |
| 3.2.4 | คลิก background | modal ปิด |

### 3.3 Enquiry Form (เพิ่งแก้ pre-fill)
| # | Steps | Expected |
|---|---|---|
| 3.3.1 | เปิด detail ขณะ login | name/phone/email pre-fill จาก session |
| 3.3.2 | submit | success state, agent ได้รับ lead + notification |
| 3.3.3 | submit ขณะ logout (guest) | สร้าง enquiry ได้ (userId=null) |

### 3.4 Book Viewing (เพิ่งทำใหม่)
| # | Steps | Expected |
|---|---|---|
| 3.4.1 | เลือกวัน/เวลา/in_person → "ยืนยัน" ขณะ logout | redirect /login?redirect=... |
| 3.4.2 | ขณะ login → submit | success state แสดงวันเวลา |
| 3.4.3 | submit แบบ video | success + meetingUrl |
| 3.4.4 | submit เวลาในอดีต | error "invalid_time" |
| 3.4.5 | submit ไม่เลือกเวลา | error "กรุณาเลือกวันและเวลา" |
| 3.4.6 | หลัง submit → agent ได้ notification | type lead_new, link `/agent/appointments` |

---

## 4. User Account

### 4.1 Sidebar (เพิ่งแก้)
| # | Steps | Expected |
|---|---|---|
| 4.1.1 | เปิด /profile, /favorites, /enquiries, /appointments | sidebar แสดงชื่อ + email ของ user จริง (ไม่ใช่ "thanapol@example.com" ที่ hardcode) |
| 4.1.2 | upload avatar → refresh | sidebar แสดงรูปใหม่ |
| 4.1.3 | nav menu ✅ ไม่มี "Notifications" |

### 4.2 Favorites + Boards (เพิ่งแก้)
| # | Steps | Expected |
|---|---|---|
| 4.2.1 | เปิด /favorites | grid บอร์ด + grid ทรัพย์ที่ถูกใจ |
| 4.2.2 | คลิกบอร์ด | ✅ navigate /favorites/[id] (ไม่ 404 อีก) — แสดง listings ในบอร์ด |
| 4.2.3 | คลิก ✕ บนทรัพย์ในบอร์ด | ลบออก, count อัปเดต |
| 4.2.4 | คลิก "แก้ไข" → เปลี่ยนชื่อ + private | บันทึกสำเร็จ |
| 4.2.5 | คลิก "ลบบอร์ด" → confirm | redirect /favorites, บอร์ดหาย |
| 4.2.6 | สร้างบอร์ดใหม่ via /favorites | ปรากฏใน grid |
| 4.2.7 | เข้า /favorites/[id] ของบอร์ดที่ไม่ใช่ของตัวเอง | redirect /favorites (404 → fallback) |

### 4.3 Enquiries
| # | Steps | Expected |
|---|---|---|
| 4.3.1 | /enquiries | list การส่งของ user, status timeline |
| 4.3.2 | คลิก "ดูประกาศ" | navigate /listing/[id] |

### 4.4 Saved Searches
| # | Steps | Expected |
|---|---|---|
| 4.4.1 | /search → "บันทึกการค้นหา" → ตั้งชื่อ | บันทึก |
| 4.4.2 | /saved-searches | list ทั้งหมด, ดู/ลบ |

### 4.5 Appointments (เพิ่งทำใหม่)
| # | Steps | Expected |
|---|---|---|
| 4.5.1 | /appointments | list การนัดของ user, tab filter, status badge |
| 4.5.2 | สถานะ confirmed + type=video | ปุ่ม "เข้าห้องประชุม" link เปิด tab ใหม่ |
| 4.5.3 | สถานะ cancelled/no_show + มี cancellationReason | กล่องสีแดง "เหตุผลจาก Agent: ..." |
| 4.5.4 | คลิก "ดูประกาศ" | navigate /listing/[id] |

---

## 5. Agent Portal

### 5.1 Sidebar (เพิ่งแก้)
| # | Steps | Expected |
|---|---|---|
| 5.1.1 | login เป็น agent | sidebar แสดงชื่อจริงของ agent (ไม่ใช่ "ณัฐพงศ์ อยู่สุข" hardcode), avatar จากโปรไฟล์ |
| 5.1.2 | nav มี "นัดดู" (Calendar icon) ระหว่าง Leads กับ สถิติ | ✅ |

### 5.2 Listings
| # | Steps | Expected |
|---|---|---|
| 5.2.1 | /agent/listings | list ทรัพย์ของ agent, filter status |
| 5.2.2 | "+ สร้างประกาศใหม่" | wizard form, submit → status=pending_review |
| 5.2.3 | คลิก "แก้ไข" | edit form, save → status เปลี่ยนเป็น revision_requested ถ้า published แล้ว |

### 5.3 Lead Inbox
| # | Steps | Expected |
|---|---|---|
| 5.3.1 | /agent/leads | tab status, list, detail panel |
| 5.3.2 | เลือก lead → เปลี่ยน status | user ได้ notification "สถานะติดต่อเปลี่ยน" |
| 5.3.3 | บันทึก note ภายใน | save success |

### 5.4 Appointments (เพิ่งทำใหม่)
| # | Steps | Expected |
|---|---|---|
| 5.4.1 | /agent/appointments | list, tab filter |
| 5.4.2 | คลิก "ยืนยัน" บน requested | ✅ status → confirmed, user ได้ notification |
| 5.4.3 | คลิก "ยกเลิก" | ✅ modal ใส่เหตุผลขึ้นกลางจอ (portal) |
| 5.4.4 | submit modal ไม่ใส่เหตุผล | ✅ ปุ่ม disabled |
| 5.4.5 | ใส่เหตุผล → ยืนยัน | ✅ status → cancelled, cancellationReason บันทึก, user ได้ notification message มี reason |
| 5.4.6 | "ไม่มาตามนัด" บน confirmed | ✅ modal เหตุผลขึ้น |
| 5.4.7 | "เสร็จสิ้น" บน confirmed | status → completed |
| 5.4.8 | กดยกเลิก agent อื่นไม่ใช่เจ้าของ | 403 forbidden |

---

## 6. Admin Console

### 6.1 Sidebar (เพิ่งแก้)
| # | Expected |
|---|---|
| 6.1.1 | sidebar แสดงชื่อจริงของ admin (ไม่ใช่ "Admin" hardcode) |

### 6.2 Listing Moderation
| # | Steps | Expected |
|---|---|---|
| 6.2.1 | /admin/listings → tab "รอพิจารณา" | list pending |
| 6.2.2 | กด "อนุมัติ" | status → published, agent ได้ notification |
| 6.2.3 | กด "ขอแก้ไข" + remark | status → revision_requested |
| 6.2.4 | กด "ปฏิเสธ" + remark | status → rejected |

### 6.3 Agent Applications
| # | Steps | Expected |
|---|---|---|
| 6.3.1 | /admin/agents | list applicants |
| 6.3.2 | "อนุมัติ" | user.role → agent, notification application_approved |
| 6.3.3 | "ขอข้อมูลเพิ่ม" / "ปฏิเสธ" | status เปลี่ยน, notification |

---

## 7. Cross-cutting

### 7.1 Theme
| # | Expected |
|---|---|
| 7.1.1 | toggle theme → persist localStorage, ไม่ flash |

### 7.2 Language
| # | Expected |
|---|---|
| 7.2.1 | switch TH ↔ EN | text เปลี่ยนทุกหน้า |

### 7.3 Permissions / Middleware
| # | Steps | Expected |
|---|---|---|
| 7.3.1 | logout → เข้า /favorites | redirect /login |
| 7.3.2 | login เป็น user → เข้า /agent | redirect /become-agent |
| 7.3.3 | login เป็น agent → เข้า /admin | 403 |
| 7.3.4 | login + เข้า /appointments | ✅ ผ่าน (อยู่ใน ACCOUNT_PREFIXES) |

### 7.4 Notifications routing
| # | Steps | Expected |
|---|---|---|
| 7.4.1 | agent ได้ notification "นัดดูทรัพย์ใหม่" | link → /agent/appointments |
| 7.4.2 | user ได้ "Agent ยืนยันการนัดดูแล้ว" | link → /appointments |

### 7.5 Data persistence
| # | Steps | Expected |
|---|---|---|
| 7.5.1 | logout/login → favorites/boards/compare ค้าง |
| 7.5.2 | localStorage clear → compare reset, favorites ผ่าน DB ยังอยู่ |

---

## 8. Bug regression

### 8.1 Compare tray (แก้ไปแล้ว)
| # | Bug ที่เคยมี | สถานะ |
|---|---|---|
| 8.1.1 | tray 2 ตัว (search local + global) ไม่ sync | ✅ เหลือ tray เดียว, sync ทุกหน้า |

### 8.2 Save-to-board modal (แก้ไปแล้ว)
| # | Bug | สถานะ |
|---|---|---|
| 8.2.1 | modal กระพริบเพราะ ancestor มี transform | ✅ ใช้ Portal ไป body |
| 8.2.2 | modal ตำแหน่งผิดในหน้า /listing/[id] (PageTransition transform) | ✅ Portal กัน containing block bug |

### 8.3 Appointment workflow (เพิ่งทำ)
| # | Bug ที่ตรวจ | สถานะ |
|---|---|---|
| 8.3.1 | จอง → agent ไม่เห็นเลย | ✅ มี Lead Inbox + notification |
| 8.3.2 | agent cancel/no_show ไม่ใส่เหตุผลได้ | ✅ modal บังคับใส่เหตุผล |
| 8.3.3 | user ไม่มีหน้าดูประวัติการนัด | ✅ /appointments + sidebar nav |

### 8.4 Account UI (เพิ่งแก้)
| # | Bug | สถานะ |
|---|---|---|
| 8.4.1 | sidebar ใช้ "ธนพล ภูวณิช / thanapol@example.com" hardcode | ✅ load จาก session |
| 8.4.2 | profile page ทุกฟิลด์ static | ✅ load + save จริง |
| 8.4.3 | ปุ่ม Camera/เปลี่ยนรูปไม่ทำงาน | ✅ wired, upload ได้ |
| 8.4.4 | password change ไม่มี handler | ✅ wired ผ่าน /api/auth/change-password |
| 8.4.5 | คลิกบอร์ด → 404 | ✅ /favorites/[boardId] page exists |
| 8.4.6 | "Notifications" ซ้ำใน sidebar | ✅ ลบออก |

---

## 9. ที่ยังควรทำต่อ (out of current scope)

- E2E automation (Playwright) — current tests เป็น manual + API
- Email notifications (เปลี่ยน status, นัดใกล้ถึง)
- 2FA / OAuth
- Avatar รูป default ตามตัวอักษรแรก (ตอนนี้ใช้ gradient)
- "ลบบัญชี" Danger Zone — ตอนนี้ disabled
- BookViewing pre-fill ชื่อ/เบอร์จาก session (เหมือน EnquiryForm ที่เพิ่งแก้)
- Wishlist board public sharing (มี isPrivate flag แล้วแต่ยังไม่มีหน้า public view)
- Saved search auto-trigger notification เมื่อมีทรัพย์ตรง (notification type มีแล้ว แต่ cron ยังไม่ implement)
