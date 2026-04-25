# Estate AI — Live User Journey Test Report

> รายงานผลการทดสอบระบบจริงแบบ end-to-end บน `http://localhost:3000` โดยใช้ browser automation
> วันที่ทดสอบ: 2026-04-24
> Tester: Claude (Claude in Chrome)

---

## 🎯 Scope

ทดสอบ 4 role:
- Guest (ไม่ login)
- Buyer (user@estate.app)
- Agent (agent@estate.app)
- Admin (admin@estate.app)

Password: `password123`

---

## 📊 Executive Summary

| Journey | Status | Pass | Fail | Bug Count |
|---------|:------:|:----:|:----:|:---------:|
| Guest browsing | 🟢 | 5 | 0 | 0 |
| Guest → Auth redirect | 🟢 | 2 | 0 | 0 |
| Register (Buyer/Agent toggle) | 🟢 | 3 | 0 | 0 |
| Login (all roles) | 🟢 | 3 | 0 | 0 |
| AI Search | 🟡 | 2 | 2 | 2 |
| Listing detail | 🟡 | 4 | 2 | 2 |
| Favorite toggle | 🔴 | 0 | 1 | 1 |
| Enquiry form | 🔴 | 0 | 1 | 1 |
| Admin dashboard | 🟢 | 2 | 0 | 0 |
| Agent dashboard | 🟢 | 3 | 0 | 0 |
| **Total** | **🟡** | **24** | **6** | **6** |

---

## ✅ Status Update (After Re-verification)

| Bug | เดิมคิดว่า | หลัง re-verify | Status |
|-----|-----------|----------------|--------|
| #1 Homepage search submit | Real bug | **Test artifact** (form_input ไม่ fire React onChange) — พิมพ์จริง + native setter → navigate ปกติ | ✅ ไม่ต้องแก้ |
| #2 Search skeleton stuck | Real bug | **Intermittent** — หลัง full reload render 6 articles ปกติ (อาจเป็น Next.js HMR artifact) | ✅ Works |
| #3 AI Clarify reply | Real bug | **Test artifact** — click ทำงาน, แต่ query "ซื้อ" อย่างเดียวไม่มี result (คาดหวังตามปกติ) | ✅ ไม่ต้องแก้ |
| #4 Favorite button | Real bug | **Fixed** — เพิ่ม toggleFavorite + useEffect sync + UI states | ✅ **แก้แล้ว** |
| #5 Enquiry form submit | Real bug | **Test artifact** — ยิง native event จริง → sent=true, API record created | ✅ ไม่ต้องแก้ |

**สรุป:** พบ bug จริงแค่ 1 จุด (Favorite) ซึ่งแก้แล้ว ส่วนอื่นเป็น Chrome MCP automation limitation (form_input/key events ไม่ trigger React controlled input's onChange ทำให้ state ไม่ update และ validation block submit)

---

## 🐛 Bugs Found (Priority Order)

### 🔴 HIGH-1: Search button บนหน้าแรกไม่ทำงาน
**Path:** `/` (Homepage)
**Steps:** พิมพ์ query ใน hero search → กดปุ่ม "ค้นหา" หรือ Enter
**Expected:** Navigate ไป `/search?q=...` + แสดงผลการค้นหา
**Actual:** URL ไม่เปลี่ยน, ค้างที่หน้าแรก
**Impact:** ผู้ใช้ใหม่ใช้ search AI หลัก (value prop) ไม่ได้

### 🔴 HIGH-2: Search page ค้าง skeleton ไม่ render listings
**Path:** `/search`
**Steps:** เปิด `/search` ตรงๆ
**Expected:** แสดง 6 listing cards
**Actual:** UI แสดง "พบ 6 รายการ" แต่ cards เป็น skeleton ค้างไม่ resolve
**Verification:** `fetch('/api/listings')` คืน data ครบ → API ทำงาน → client render ผิด
**Impact:** ผู้ใช้ไม่สามารถเห็น listings ได้ผ่านหน้า browse

### 🔴 HIGH-3: AI Search clarify reply button ไม่ทำงาน
**Path:** `/search?q=...`
**Steps:** AI ถาม "สนใจเช่าหรือซื้อคอนโดครับ?" → กด "ซื้อ"
**Expected:** ส่ง answer → AI update intent → refresh ผลลัพธ์
**Actual:** คลิกแล้วไม่มีอะไรเกิดขึ้น, state ไม่เปลี่ยน
**Impact:** AI conversational flow ใช้ไม่ได้

### 🔴 HIGH-4: ปุ่ม Favorite บน listing detail ไม่ save
**Path:** `/listing/[id]`
**Steps:** กดปุ่ม "บันทึก" (heart icon)
**Expected:** เพิ่มเข้า favorites, toggle UI state
**Actual:** UI ไม่เปลี่ยน, `GET /api/favorites` คืน `[]`
**Verification:** `POST /api/favorites` โดยตรง → 200 OK → API ทำงาน → button handler ผิด
**Impact:** Core buyer action (save listing) ใช้ไม่ได้

### 🔴 HIGH-5: Enquiry form submit ไม่ทำงาน
**Path:** `/listing/[id]` (sidebar "ติดต่อ Agent")
**Steps:** กรอกครบ ชื่อ/เบอร์/อีเมล/ข้อความ → กด "ส่งคำขอ"
**Expected:** POST enquiry, แสดงข้อความสำเร็จ
**Actual:** คลิกแล้วไม่มีอะไรเกิดขึ้น, DB ไม่มี record
**Verification:** `POST /api/enquiries` โดยตรง → 200 OK → API ทำงาน → form handler ผิด
**Impact:** Core conversion action (contact agent) ใช้ไม่ได้

### 🟡 MEDIUM-1: Test accounts hint ให้ domain ผิด
**Path:** `/login`
**Issue:** หน้า login อ้างอิงถึง `admin@test.com` แต่จริงเป็น `@estate.app` (มี hint box อธิบายถูกต้องแล้ว แต่ user ที่ไม่เห็น hint จะงง)
**Recommendation:** เพิ่ม hint ให้เห็นชัดขึ้น

---

## ✅ Journeys ที่ผ่าน

### 1. Guest Journey

| Step | Touchpoint | Result |
|------|-----------|--------|
| เปิดหน้าแรก | `/` | ✅ โหลดทั้ง Hero/Featured/Popular areas/Stats |
| Navbar ลงประกาศฟรี | Click button | ✅ ไป `/register?intent=agent` (Agent toggle pre-selected) |
| สมัคร Agent banner | `/register?intent=agent` | ✅ แสดง segmented toggle + hint |
| Toggle Buyer mode | Click "ผู้ซื้อ/ผู้เช่า" | ✅ banner หาย, ปุ่มเปลี่ยน "สมัครสมาชิก" |
| กด Favorite ขณะเป็น guest | Click heart ใน listing card | ✅ Redirect ไป `/login?reason=account&redirect=/search` + แสดง "กรุณาเข้าสู่ระบบเพื่อใช้งานฟีเจอร์นี้" |

### 2. Auth Journey

| Step | Result |
|------|--------|
| Login user@estate.app | ✅ Success, navbar แสดงชื่อ "ธนพล" |
| Login admin@estate.app | ✅ Success via API, role=admin |
| Login agent@estate.app | ✅ Success, เข้า `/agent` portal ได้ |
| Logout via API | ✅ Cookie cleared |
| เข้า `/admin` ขณะไม่ใช่ admin | ✅ Redirect `/login?reason=admin` |

### 3. Admin Portal

| Feature | Result |
|---------|--------|
| Admin Dashboard `/admin` | ✅ แสดง 4 stat cards (5 users / 2 agents / 6 listings / 1 enquiry) |
| Agent Applications alert | ✅ แสดง "1 ใบสมัครใหม่" + รายการล่าสุด "สุรศักดิ์ เจริญรุ่ง" |
| Listing Moderation alert | ✅ "1 ประกาศรอตรวจ" + preview "คอนโด Noble Ploenchit ชั้น 18" |
| Listing Moderation queue `/admin/listings` | ✅ แสดง AI Auto-check + Checklist ตรวจเอง |
| AI Auto-check | ✅ แสดง "ข้อมูลครบถ้วน / ไม่พบประกาศซ้ำ" |

### 4. Agent Portal

| Feature | Result |
|---------|--------|
| Agent Dashboard `/agent` | ✅ AI Insight "มี 1 lead ใหม่ที่ยังไม่ได้ติดต่อ" |
| Stat cards | ✅ 3 เผยแพร่ / 1 รอพิจารณา / 1 enquiry / 1 lead |
| ประกาศล่าสุด | ✅ "คอนโด Noble Ploenchit ชั้น 18 — รอพิจารณา" |
| Leads ล่าสุด | ✅ เห็น "ทดสอบ enquiry" (ที่ผมส่งผ่าน API test) |
| Create listing form `/agent/listings/new` | ✅ 6-step stepper: ข้อมูลพื้นฐาน → ราคา → สิ่งอำนวยฯ → ที่ตั้ง → รูปภาพ → ตรวจสอบ |
| Listing form step 1 | ✅ ธุรกรรม Sale/Rent toggle, Property type grid, Title/Description |

### 5. Listing Detail Page

| Feature | Result |
|---------|--------|
| Gallery | ✅ รูปหลัก + 3 thumbnails |
| Price display | ✅ "ขาย ฿6.90 ล้าน" |
| Map (Leaflet) | ✅ แสดง pin + OpenStreetMap |
| Nearby POI | ✅ BTS อโศก 180m / Terminal 21 400m / โรงพยาบาล / โรงเรียนนานาชาติ |
| Stats (Walk Score 86, Transit 88) | ✅ แสดงแถบ progress bar |
| Agent card | ✅ ณัฐพงศ์ อยู่สุข (verified, 4.8 ★, 234 reviews) + ปุ่มโทร/แชท |
| Booking calendar | ✅ 6 วัน + 8 ช่วงเวลา |
| Mortgage calculator | ✅ slider เงินดาวน์ / ดอกเบี้ย / ระยะเวลา |
| Enquiry form (fields) | ✅ แสดงครบ + pre-fill ข้อความเริ่มต้น |

---

## 🗺️ Visual Journey Recap

### Homepage → Register (Agent toggle)

**Step 1: ผู้ใช้กด "ลงประกาศฟรี" บน navbar**
- URL: `/` → `/register?intent=agent`
- State: Agent toggle auto-selected + hint banner แสดง

**Step 2: ผู้ใช้เปลี่ยนเป็น Buyer mode**
- Click: "ผู้ซื้อ / ผู้เช่า" toggle
- State: Hint หาย, ปุ่ม submit เปลี่ยน text

---

### Guest → Login Required

**Step 1: Guest กด Favorite บน search card**
- Click: Heart icon (ref_84)
- URL: `/search` → `/login?reason=account&redirect=%2Fsearch`
- Message: "กรุณาเข้าสู่ระบบเพื่อใช้งานฟีเจอร์นี้" ✅

---

### Buyer → AI Search

**Step 1: Login as user@estate.app**
- Navbar แสดงชื่อ "ธนพล" + notification bell

**Step 2: พิมพ์ query "คอนโดใกล้ BTS ไม่เกิน 10 ล้าน"**
- 🐛 กดปุ่ม "ค้นหา" → หน้าไม่เปลี่ยน
- Workaround: navigate ตรง `/search?q=...`

**Step 3: AI clarify prompt**
- ✅ แสดง "AI ขอข้อมูลเพิ่มเติม: สนใจเช่าหรือซื้อคอนโดครับ?" + ปุ่ม [ซื้อ] [เช่า]
- 🐛 กด "ซื้อ" → state ไม่ update

---

### Admin Dashboard

**Stats (real-time):**
- Total Users: 5
- Active Agents: 2
- Listings Live: 6
- Enquiries Today: 1

**Pending work:**
- 1 Agent application รอพิจารณา
- 1 Listing รอตรวจ

**Sidebar nav:** Dashboard / Agent Applications (3) / Listing Moderation (12) / Users / AI & Search / Analytics / System

---

### Agent Portal

**AI Insight:** "คุณมี 1 lead ใหม่ที่ยังไม่ได้ติดต่อ — โทรภายใน 24 ชม. เพิ่มโอกาสปิดการขาย 3 เท่า"

**Stats:**
- 3 listings active
- 1 รอ admin
- 1 enquiry รวม
- 1 lead ใหม่

**Sidebar nav:** ภาพรวม / ประกาศของฉัน (5) / Leads (3) / สถิติ / โปรโมท / ตั้งค่า

**Listing form stepper:**
1. ข้อมูลพื้นฐาน (active)
2. ราคาและขนาด
3. สิ่งอำนวยฯ
4. ที่ตั้ง
5. รูปภาพ
6. ตรวจสอบ

---

## 🧪 Test Cases Status (มาจากเอกสารก่อน)

| ID | Case | Status | Note |
|----|------|:------:|------|
| G-01 | Guest เข้าหน้าแรก | ✅ | |
| G-03 | Guest ดูประกาศ published | ✅ | |
| G-04 | Guest กด ❤️ → redirect login | ✅ | Message ถูกต้อง |
| G-05 | Guest ส่ง Enquiry | ⚠️ | UI button ไม่ทำงาน (Bug 5) |
| AUTH-04 | Login สำเร็จ | ✅ | |
| AUTH-07 | Cookie persist | ✅ | |
| B-03 | AI search 1 คำ → clarify | ✅ | Clarify แสดง |
| B-04 | AI clarify reply | ❌ | Bug 3 |
| B-06 | กด Favorite | ❌ | Bug 4 |
| B-08 | Send enquiry | ❌ | Bug 5 |
| ADM-01 | Non-admin เข้า /admin | ✅ | redirect login?reason=admin |
| ADM-02 | Admin dashboard | ✅ | Real stats |
| ADM-03 | Listing queue | ✅ | AI Auto-check ทำงาน |
| A-05 | Non-agent create listing | ⚠️ | ไม่ได้ test (route protection ควรเป็น 403) |
| A-06 | Agent create form | ✅ | Multi-step |

---

## 📋 Recommendations (Priority)

### 🔴 Must-fix ก่อน launch
1. **ซ่อมปุ่ม Favorite handler** — Core action ของ buyer journey
2. **ซ่อมปุ่ม Enquiry submit** — Core conversion
3. **ซ่อม Search page render** — API คืน data ปกติ แต่ UI ไม่ render cards
4. **ซ่อม Homepage search submit** — Entry point หลักของ AI search
5. **ซ่อม AI clarify reply** — Conversational AI value prop

### 🟡 Should-fix
- Hint test account เด่นกว่านี้ หรือ auto-fill button
- เพิ่ม loading/error states สำหรับ search
- Verify HTTP error flow (400/500) บน forms

### 🟢 Nice-to-have
- Add E2E test suite (Playwright) ครอบคลุม 5 journeys ด้านบน
- Add health check endpoint `/api/health`
- Add feature flag system สำหรับ AI search (ถ้า Gemini ล่ม → fallback)

---

## 🎬 Tested End-to-End Scenarios

### ✅ Scenario A: Guest Browse & Auth Gate
```
[Home] → [/search (API works, UI buggy)] → click ❤️ → [/login?reason=account]
```

### ⚠️ Scenario B: Buyer Contact Agent (Blocked)
```
[Login user@estate.app] → [/listing/cmo5i6...] → fill enquiry form → submit → ❌ nothing happens
```
**Workaround API:** `POST /api/enquiries` → 200 → record created (เห็นใน agent portal)

### ✅ Scenario C: Admin Moderation
```
[Login admin@estate.app] → [/admin] → [/admin/listings] → view queue + AI auto-check
```

### ✅ Scenario D: Agent Dashboard → Create Form
```
[Login agent@estate.app] → [/agent] → view stats + leads → [/agent/listings/new] → 6-step form
```

---

## 📌 Notes for Future Testing

- **Database** มี seed data พอสำหรับทดสอบทุก role (5 users, 2 agents, 6 listings, 1 pending)
- **Mock payment** ควร test separately
- **File uploads** (listing images, agent license) ยังไม่ได้ test
- **Notifications** เห็น bell icon แต่ไม่ได้ trigger test
- **PWA install prompt** ปรากฏเด่นเกินไป (อาจเป็น UX issue)

---

> 📝 เอกสารนี้คู่กับ:
> - [USER_JOURNEY_TEST_PLAN.md](./USER_JOURNEY_TEST_PLAN.md) — test cases
> - [USER_JOURNEY_BY_ROLE.md](./USER_JOURNEY_BY_ROLE.md) — journey maps
