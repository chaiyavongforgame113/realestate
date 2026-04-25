# Estate AI - Detailed User Journey by Role

> เอกสารอธิบาย User Journey แบบละเอียดแยกตามบทบาท (Role) พร้อม Touchpoints, Emotional Stages, Pain Points และ Opportunities

---

## 📑 สารบัญ

1. [Guest (ผู้เยี่ยมชม)](#1-guest-ผู้เยี่ยมชม)
2. [Buyer / Renter (ผู้ซื้อ/เช่า)](#2-buyer--renter-ผู้ซื้อเช่า)
3. [Agent (นายหน้า/เจ้าของประกาศ)](#3-agent-นายหน้าเจ้าของประกาศ)
4. [Admin (ผู้ดูแลระบบ)](#4-admin-ผู้ดูแลระบบ)
5. [Cross-Role Scenarios](#5-cross-role-scenarios)

---

## 1. Guest (ผู้เยี่ยมชม)

> ผู้ใช้ที่ยังไม่ได้ Login — ค้นหาและดูข้อมูลเบื้องต้นได้ แต่ยังทำธุรกรรมไม่ได้

### 🎯 Goals
- สำรวจว่าเว็บนี้มีบ้านที่สนใจไหม
- เปรียบเทียบกับเว็บอื่น
- เข้าใจว่าราคาตลาดประมาณเท่าไร

### 🗺️ Journey Map

```
   ┌──────────────────────────────────────────────────────────┐
   │  Stage 1   │  Stage 2   │  Stage 3   │  Stage 4          │
   │ DISCOVER   │  EXPLORE   │  EVALUATE  │  CONVERT          │
   ├────────────┼────────────┼────────────┼───────────────────┤
   │ Landing    │ Search/    │ Listing    │ Register /        │
   │ Page       │ Browse     │ Detail     │ Login             │
   └──────────────────────────────────────────────────────────┘
```

### 🔍 Detailed Steps

#### Stage 1: DISCOVER — เข้าเว็บครั้งแรก
**Touchpoint:** `/` (Homepage)

**สิ่งที่ทำได้:**
- เห็น Hero + Search bar
- กด Property Types (condo/house/townhouse/land/commercial)
- ดู Featured Listings grid
- ดู Popular Areas
- อ่าน Testimonials
- เลื่อนไปดู "Why AI" section

**Emotional State:** 😐 Curious / Skeptical
> "เว็บนี้น่าเชื่อถือไหม? ของจริงหรือแค่โฆษณา?"

**Pain Points:**
- ไม่รู้จัก AI search → กลัวใช้ยาก
- ไม่เห็นราคาชัดเจนในหน้าแรก

---

#### Stage 2: EXPLORE — เริ่มค้นหา
**Touchpoint:** `/search`

**สิ่งที่ทำได้:**
- พิมพ์ natural language: "คอนโด 2 ห้องนอน ใกล้ BTS อโศก ไม่เกิน 5 ล้าน"
- AI ถาม clarify: "ต้องการย่านไหนเป็นพิเศษ? Sukhumvit/Silom/Ladprao?"
- ตอบ → ได้ผลลัพธ์พร้อม chips แสดง intent
- ลองเปลี่ยน View Mode: Grid / List / Map
- Toggle Filter Sidebar (bedrooms, price, district)
- Sort: Relevance / Price / Newest
- Hover ดูข้อมูลบน Map

**Emotional State:** 🤔 Engaged → 😊 Delighted
> "ว้าว AI เข้าใจภาษาคนดีจัง"

**Pain Points:**
- AI ถาม clarify หลายรอบ → ไม่อยากตอบ
- ผลลัพธ์เยอะไป ไม่รู้เลือกอะไร

**Opportunities:**
- แสดง "Quick filter chips" ลด clarify rounds
- AI match reason ต้องชัดและน่าเชื่อ

---

#### Stage 3: EVALUATE — ดูรายละเอียด
**Touchpoint:** `/listing/[id]`

**สิ่งที่ทำได้:**
- เลื่อนดู Image Gallery
- ดู Verified Badge (blockchain)
- อ่าน ListingInfo (ราคา, ขนาด, BR/BA/parking)
- ดู Virtual Tour (ถ้ามี)
- ดู Location Map + Neighborhood Insights
- เล่น Mortgage Calculator
- ดู Similar Listings

**สิ่งที่ทำไม่ได้ (ต้อง Login):**
- ❌ กด Favorite (❤️)
- ❌ Enquiry form
- ❌ Book Viewing
- ❌ Reserve/Payment
- ❌ Save Search
- ❌ Write Review

**Emotional State:** 😍 Interested → 😤 Blocked
> "อยากเซฟไว้ดูอีกรอบ แต่ต้องสมัคร..."

**Pain Points:**
- ต้อง register ก่อนถึงจะทำอะไรได้
- ไม่รู้ว่าสมัครแล้วจะได้อะไรเพิ่ม

**Opportunities:**
- แสดง modal "Sign up to save" ที่เห็น value ชัด
- อนุญาต guest comparison 2-3 รายการ

---

#### Stage 4: CONVERT — สมัครสมาชิก
**Touchpoint:** `/register` หรือ `/login`

**สิ่งที่ทำ:**
- กรอก Name, Email, Password (มี live validation)
- ยอมรับ Terms + Privacy
- กด Register
- หรือเลือก Google OAuth (1-click)
- Redirect กลับไปหน้าเดิม

**Emotional State:** 😌 Committed

---

### 🧪 Test Cases สำหรับ Guest

| ID | Test | Expected |
|----|------|----------|
| G-01 | เข้าหน้าแรกโดยไม่ login | เห็นทุก section, ไม่ redirect |
| G-02 | Search AI โดยไม่ login | ใช้ได้, session token ถูกสร้าง |
| G-03 | ดูประกาศ published | แสดงรายละเอียดครบ |
| G-04 | กด ❤️ บน listing card | redirect to /login |
| G-05 | ส่ง Enquiry form | 401 หรือ modal login |
| G-06 | ดู draft/pending listing | 404 |
| G-07 | Navigation ไป /profile | redirect to /login |
| G-08 | เปิดในโหมด incognito | cookie ทำงานถูกต้อง |

---

## 2. Buyer / Renter (ผู้ซื้อ/เช่า)

> User ที่ Login แล้ว — สามารถทำทุก interaction ได้ครบ

### 🎯 Goals
- หาบ้าน/คอนโดที่ตรงใจและงบประมาณ
- ติดต่อ Agent สะดวก
- เปรียบเทียบหลายๆ รายการ
- จองและมัดจำอย่างปลอดภัย

### 🗺️ Journey Map (Full Lifecycle)

```
┌─────────┬──────────┬───────────┬──────────┬──────────┬──────────┐
│ ONBOARD │ SEARCH   │ SHORTLIST │ CONNECT  │ COMMIT   │ ADVOCATE │
├─────────┼──────────┼───────────┼──────────┼──────────┼──────────┤
│Register │Search AI │Favorite   │Enquiry   │Appointm't│Review    │
│Profile  │Filter    │Wishlist   │Chat/Call │Payment   │Share     │
│Prefer   │Map view  │Compare    │          │Contract  │          │
└─────────┴──────────┴───────────┴──────────┴──────────┴──────────┘
```

### 🔍 Detailed Steps

#### Stage 1: ONBOARD — สมัครและตั้งค่า
**Touchpoints:** `/register` → `/account/profile` → `/account/settings`

**Flow:**
1. Register (email + password + name)
2. Verify email (ได้ลิงก์ทางอีเมล)
3. Login ครั้งแรก
4. ไป `/account/profile` → เพิ่มรูป, เบอร์โทร, นามสกุล
5. ตั้งค่า Preferences (notification channels, language)

**Data Collected:**
- Email, password
- firstName, lastName
- phone, avatarUrl (optional)

**Emotional State:** 😊 Welcoming

---

#### Stage 2: SEARCH — ค้นหาเชิงลึก
**Touchpoints:** `/search`, `/`, Saved Searches

**Flow A: First-time search**
1. พิมพ์ query → AI parse intent
2. ถ้าข้อมูลไม่พอ AI clarify (max 2 rounds)
3. ได้ผลลัพธ์
4. กด "Save search" → ตั้งชื่อ เช่น "Condo Asok Q2 2026"
5. Toggle notification on new match

**Flow B: Returning search**
1. `/account/saved-searches` → กด "Re-run" ใน saved search
2. ได้ผลลัพธ์ใหม่ (รวมประกาศใหม่ตั้งแต่ครั้งที่แล้ว)
3. หรือ ได้ notification "มีประกาศใหม่ตรง search ของคุณ"

**Filter Combinations:**
- listing_type: sale/rent
- property_type: condo/house/townhouse/land/commercial
- price_min, price_max
- bedrooms, bathrooms
- area_min, area_max
- district, province
- amenities[]

**Emotional State:** 🎯 Focused → 🤩 Excited (เจอของใช่)

---

#### Stage 3: SHORTLIST — คัดกรอง
**Touchpoints:** `/account/favorites`, `/compare`

**Flow:**
1. ดู listing → กด ❤️ (Add Favorite)
2. สร้าง Wishlist Board "ตัวเลือก Top 5"
3. เพิ่ม note ในแต่ละ item ("ใกล้ office แม่", "ราคาต่อรองได้?")
4. เลือก 3-4 รายการ → กด Compare
5. ดูตาราง side-by-side (price, size, amenities, location)
6. ตัดสินใจเหลือ 2 รายการ

**Emotional State:** 🧐 Analytical

**Pain Points:**
- เปรียบเทียบเกิน 4 รายการแล้วตาลาย
- อยากแชร์ shortlist ให้คู่สมรสดูด้วย

---

#### Stage 4: CONNECT — ติดต่อ Agent
**Touchpoint:** `/listing/[id]` → Enquiry form + Appointment

**Flow:**
1. เลือกประกาศที่สนใจ
2. กด "Enquire now" → ฟอร์ม pre-filled (name, phone, email)
3. เพิ่มข้อความ: "สนใจนัดชม เสาร์นี้ได้ไหม?"
4. Submit → Agent ได้ notification
5. กด "Book Viewing" → เลือกวันที่/เวลา, เลือก type (in_person / video call)
6. รอ Agent confirm → ได้ notification + อีเมล
7. (ถ้า agent ขอ) upload เอกสารเพิ่ม

**Enquiry Status (ฝั่ง user):**
- `new` → ส่งแล้ว รอ agent
- `contacted` → agent ติดต่อกลับแล้ว
- `viewing_scheduled` → นัดดูแล้ว
- `negotiating` → กำลังเจรจา
- `won` / `lost` → จบแล้ว

**Emotional State:** 😬 Anxious → 😌 Relieved (เมื่อ agent ตอบกลับ)

---

#### Stage 5: COMMIT — ชำระและยืนยัน
**Touchpoint:** `/listing/[id]` → Reserve button → Payment page

**Flow:**
1. ตกลงกับ Agent → กด "Reserve"
2. เลือก purpose: `reservation_fee` / `deposit` / `rent_deposit`
3. เลือกวิธีชำระ:
   - Card (Visa/Master)
   - PromptPay QR
   - Bank Transfer
   - Apple Pay / Google Pay
4. ชำระเสร็จ → status = succeeded
5. ได้ใบเสร็จ (email + in-app)
6. Listing เปลี่ยนสถานะเป็น "Reserved"

**Emotional State:** 💳 Nervous → 😊 Confident

**Pain Points:**
- กลัวโอนแล้วไม่ได้เจอของจริง
- ต้องการ escrow / refund policy ชัด

---

#### Stage 6: ADVOCATE — รีวิวและบอกต่อ
**Touchpoint:** `/listing/[id]` review section, Profile

**Flow:**
1. หลังเข้าอยู่ 1 เดือน ได้ notification "รีวิวประสบการณ์ของคุณ"
2. ให้คะแนน 1-5 ดาว
3. เขียน title + body
4. เลือก target: listing / agent / area / project
5. Submit → แสดงบน listing

**Emotional State:** 🌟 Fulfilled / Frustrated (แล้วแต่ประสบการณ์)

---

### 🧪 Test Cases สำหรับ Buyer

| ID | Test | Expected |
|----|------|----------|
| B-01 | Register + auto login | สร้าง user + profile, ได้ cookies |
| B-02 | Update profile picture | upload สำเร็จ, แสดงใน navbar |
| B-03 | Search AI พิมพ์ 1 คำ | AI clarify ครั้งแรก |
| B-04 | Save search + enable notify | saved + flag on |
| B-05 | Add favorite (listing ของตัวเอง) | ทำไม่ได้ (self-listing) |
| B-06 | Wishlist board ซ้ำชื่อ | อนุญาต / block แล้วแต่ spec |
| B-07 | Compare 5+ listings | จำกัดที่ 4 |
| B-08 | Send enquiry empty message | validation error |
| B-09 | Appointment ในอดีต | block |
| B-10 | Payment ด้วย card invalid | status = failed, ไม่ลด listing |
| B-11 | Review ประกาศที่ไม่เคย enquiry | allow หรือ require proof |
| B-12 | Review rating 0 หรือ 6 | 400 validation |
| B-13 | Logout แล้วเข้า /favorites | redirect login |
| B-14 | Delete account | soft delete, data retention policy |

---

## 3. Agent (นายหน้า/เจ้าของประกาศ)

> User ที่ role = agent — สร้างและบริหารประกาศได้

### 🎯 Goals
- ลงประกาศอย่างรวดเร็วและมีคุณภาพผ่าน review
- ได้ Lead ที่มี quality สูง
- ติดตาม performance ของประกาศ
- ปิดการขายให้ได้เยอะ

### 🗺️ Journey Map

```
┌──────────┬─────────┬──────────┬─────────┬───────────┬──────────┐
│ APPLY    │ CREATE  │ REVIEW   │ PUBLISH │ ENGAGE    │ CLOSE    │
├──────────┼─────────┼──────────┼─────────┼───────────┼──────────┤
│Apply form│ Draft   │Submit    │Published│Lead mgmt  │Won/Lost  │
│Upload doc│ Fill 6  │Wait admin│Stats    │Chat       │Analytics │
│Wait      │ steps   │Revise?   │Live     │Appointment│          │
└──────────┴─────────┴──────────┴─────────┴───────────┴──────────┘
```

### 🔍 Detailed Steps

#### Stage 1: APPLY — สมัครเป็น Agent
**Touchpoint:** `/become-agent`

**Flow:**
1. User ทั่วไปกด "Become Agent" จาก navbar/footer/homepage CTA
2. อ่าน 4 benefits (lead quality, free listings, verified badge, analytics)
3. กรอกฟอร์ม:
   - Full name (ชื่อจริง)
   - Company name (บริษัท/นามปากกา)
   - Phone
   - Experience years (ตัวเลข)
   - Expertise (comma-separated: condo, sukhumvit, luxury)
   - **Upload license file** (drag-drop; PDF/JPG)
   - **Upload ID copy**
4. Submit → แสดง Success state (3-step tracker)
5. สถานะ: application = `pending_review`
6. User role ยังเป็น `user` (จะเปลี่ยนเมื่อ admin approve)

**Emotional State:** 🤞 Hopeful

**Wait Time:** 24-72 ชม. (SLA)

---

#### Stage 2: APPROVED — ได้รับอนุมัติ
**Touchpoint:** Email + Notification + `/agent` dashboard

**Flow:**
1. Admin approve → Notification `application_approved`
2. User role เปลี่ยนเป็น `agent`
3. Email: "ยินดีด้วย! Agent account ของคุณพร้อมใช้งาน"
4. Navbar เปลี่ยน — เห็น "Agent Portal" link
5. คลิก → `/agent` Dashboard

**Dashboard เห็นอะไรครั้งแรก:**
- AI Insight card (empty state: "Create your first listing")
- Stat cards (0, 0, 0, 0)
- Recent Listings (empty)
- Recent Leads (empty)

---

#### Stage 3: CREATE — สร้างประกาศแรก
**Touchpoint:** `/agent/listings/new`

**Multi-step Form (6 steps):**

**Step A — Basic**
- Transaction type: Sale / Rent (button toggle)
- Property type grid: Condo / House / Townhouse / Land / Commercial
- Title (text input)
- Description (textarea, markdown)

**Step B — Price & Size**
- Price THB
- Usable area (sqm)
- Bedrooms (spinner)
- Bathrooms (spinner)
- Parking (spinner)

**Step C — Amenities**
- Furnishing: Fully / Partial / None
- Amenity chips: pool, gym, security, parking, pet_friendly, etc.

**Step D — Location**
- Project name
- District / Province
- Map picker (drag marker → get lat/lng)

**Step E — Photos**
- Drag-drop zone (max 20 images)
- Set cover (⭐ icon)
- Reorder
- Virtual tour URL (optional, Matterport/Kuula)
- Video URL (YouTube)

**Step F — Review**
- Summary table
- Info box: "Admin จะตรวจใน 2-4 ชม."
- 2 Buttons:
  - **Save Draft** (เก็บไว้แก้ทีหลัง)
  - **Submit for Approval** → status = `pending_review`

**Emotional State:** 😤 Laborious → 😎 Proud (พอเสร็จ)

**Pain Points:**
- 6 steps ยาว → ทิ้งกลางทาง
- Upload รูปเยอะๆ ช้า

**Opportunities:**
- Auto-save draft ทุก step
- Progress persistence

---

#### Stage 4: REVIEW — รอตรวจ
**Touchpoint:** `/agent/listings` (Tab: Pending Review)

**Flow:**
1. Listing อยู่ในสถานะ `pending_review`
2. Agent รอ notification
3. **Outcome A: Approved** → notification `listing_approved`, status = `published`
4. **Outcome B: Rejected** → notification พร้อมเหตุผล, status = `rejected`
5. **Outcome C: Revision Requested** → notification + notes, status = `revision_requested`
   - Agent เข้า edit → แก้ตาม notes → Submit again

**SLA:** 2-4 ชม.

---

#### Stage 5: PUBLISH — ประกาศ Live
**Touchpoint:** `/agent` Dashboard, `/agent/listings`

**Stats เริ่มไหล:**
- Views count
- Favorite count
- Enquiry count

**AI Insight card อัปเดต:**
> "Your Asok condo got 3 new inquiries - 1 uncontacted for 18 hours"

---

#### Stage 6: ENGAGE — จัดการ Lead
**Touchpoint:** `/agent/leads`

**Flow:**
1. Enquiry ใหม่เข้า → notification `lead_new`
2. Agent เปิด `/agent/leads`
3. เห็น list: name, avatar, message preview, status chip, timestamp
4. คลิกเพื่อดูรายละเอียด
5. Update status:
   - `new` → `contacted` (เมื่อโทร/แชทแล้ว)
   - → `viewing_scheduled` (นัดชมแล้ว)
   - → `negotiating` (ต่อรอง)
   - → `won` (ปิดดีล) / `lost` (ล่มดีล)
6. เพิ่ม note ภายใน (ไม่ให้ buyer เห็น)

**Appointment Flow:**
1. Buyer ส่ง appointment request
2. Agent ได้ notification
3. Confirm หรือ propose เวลาใหม่
4. Sync กับ calendar

**Emotional State:** 🔥 Hustle mode

---

#### Stage 7: ANALYZE — Analytics
**Touchpoint:** `/agent/analytics`

**Metrics:**
- Views per listing (chart)
- Enquiry conversion rate (views → enquiry)
- Lead → Won rate
- Average response time
- Top performing listings
- Revenue (ถ้ามี)

**Emotional State:** 📊 Data-driven

---

### 🧪 Test Cases สำหรับ Agent

| ID | Test | Expected |
|----|------|----------|
| A-01 | Apply without license file | validation error |
| A-02 | Apply เมื่อยังไม่ verify email | block |
| A-03 | Apply ซ้ำขณะ pending | block |
| A-04 | Apply หลังถูก reject | อนุญาต resubmit |
| A-05 | Create listing ก่อน approve | 403 |
| A-06 | Save draft step 3 แล้ว logout/กลับมา | resume step 3 |
| A-07 | Submit listing ไม่มีรูป | validation error |
| A-08 | Submit ราคาติดลบ | validation error |
| A-09 | Agent A edit listing ของ Agent B | 403 |
| A-10 | Revise rejected listing | status กลับ pending_review |
| A-11 | Delete published listing | unpublish + archive |
| A-12 | View leads ของ agent อื่น | 403 |
| A-13 | Update lead status backward (won→new) | block invalid transition |
| A-14 | Analytics เมื่อไม่มี data | empty state |
| A-15 | Upload รูป > 20 ภาพ | แสดง error |

---

## 4. Admin (ผู้ดูแลระบบ)

> ตรวจสอบ อนุมัติ และควบคุมคุณภาพของระบบ

### 🎯 Goals
- รักษาคุณภาพประกาศ (กรองสแปม, ข้อมูลผิด)
- อนุมัติ Agent ที่น่าเชื่อถือ
- ดูแล users (ระงับกรณีละเมิด)
- ติดตาม health ของระบบ

### 🗺️ Journey Map

```
┌──────────┬──────────┬──────────┬──────────┬──────────┐
│ MONITOR  │ TRIAGE   │ REVIEW   │ ACT      │ AUDIT    │
├──────────┼──────────┼──────────┼──────────┼──────────┤
│Dashboard │Queue list│Open detail│Approve/  │Log trail │
│Alerts    │Priority  │Check     │Reject/   │          │
│          │          │criteria  │Revise    │          │
└──────────┴──────────┴──────────┴──────────┴──────────┘
```

### 🔍 Detailed Steps

#### Stage 1: MONITOR — เปิดวัน
**Touchpoint:** `/admin` Dashboard

**เห็นอะไร:**
- **Stat Cards:**
  - Total Users (เปลี่ยนแปลงวันนี้)
  - Active Agents
  - Published Listings
  - Enquiries Today
- **Alert Cards:**
  - "5 Agent Applications pending" → CTA
  - "12 Listings รอตรวจ" → CTA
- **Recent Applications** (3 รายการล่าสุด)
- **Listing Review Queue preview** (3 รายการ)
- **AI Analytics teaser** (popular searches)

**Emotional State:** 🎯 Focused

---

#### Stage 2: TRIAGE — จัดลำดับความสำคัญ
**Touchpoints:** `/admin/listings`, `/admin/agents`, `/admin/users`

**Priority Rules:**
- Listing รอนานกว่า 4 ชม. → red flag
- Agent application รอกว่า 48 ชม. → red flag
- User report (abuse) → สูงสุด

---

#### Stage 3: REVIEW — ตรวจสอบรายละเอียด

**A. Listing Moderation (`/admin/listings`)**

**UI Structure:**
- **Left sidebar:** scrollable queue (thumbnail, title, agent name, submitted date)
- **Right panel:** รายละเอียดเต็ม
  - Image gallery
  - Listing info (price, size, bed/bath, amenities)
  - **Verification Checklist (6 ข้อ):**
    - ☐ รูปชัด ไม่ซ้ำ ไม่มี watermark
    - ☐ ราคาสมเหตุผล (เทียบตลาด)
    - ☐ ข้อมูลครบถ้วน
    - ☐ ตำแหน่ง map ถูกต้อง
    - ☐ ไม่ซ้ำกับประกาศอื่น
    - ☐ ไม่มีเบอร์/contact ในรูป
  - **Action Buttons:**
    - ✅ Approve (เขียว)
    - ❌ Reject (แดง) — ต้องกรอกเหตุผล
    - 🔄 Request Revision (ส้ม) — ระบุสิ่งที่ต้องแก้
    - 🚫 Unpublish (สำหรับที่ published แล้วแต่มีปัญหา)

**Flow:**
1. คลิก listing ใน queue
2. Check 6 เกณฑ์
3. เลือก action
4. ถ้า reject/revise → กรอก reason
5. Submit → notification ส่งให้ agent

---

**B. Agent Application Review (`/admin/agents`)**

**เช็คอะไร:**
- ใบอนุญาตจริงไหม (เช็คกับ DBD/สมาคมนายหน้า)
- เอกสารครบและอ่านออก
- ชื่อ-นามสกุลตรงกับใบอนุญาต
- ประสบการณ์สมเหตุผล

**Actions:**
- Approve → user.role = agent
- Reject → เหตุผลชัดเจน
- Request more info → กลับไปให้กรอกเพิ่ม

---

**C. User Management (`/admin/users`)**

**Actions:**
- View user detail + activity log
- Suspend user (กรณี spam, abuse, ฉ้อโกง)
- Unsuspend
- Force reset password
- (รุนแรง) Delete account

---

#### Stage 4: ACT — ดำเนินการ
**Flow:**
1. ตัดสินใจ
2. กรอก note (ถ้าจำเป็น)
3. Submit
4. ระบบ:
   - บันทึก AdminAction log
   - ส่ง notification ให้ผู้ที่เกี่ยวข้อง
   - Update status ของ target entity

---

#### Stage 5: AUDIT — ตรวจสอบย้อนหลัง
**Touchpoint:** `/admin/system` หรือ Audit log

**เห็น:**
- ใครทำอะไร เมื่อไหร่
- ผลลัพธ์
- สามารถ rollback บาง action

---

### 🧪 Test Cases สำหรับ Admin

| ID | Test | Expected |
|----|------|----------|
| AD-01 | User ทั่วไปเข้า /admin | 403 หรือ redirect |
| AD-02 | Admin ดู dashboard | stats ถูกต้อง real-time |
| AD-03 | Approve listing | status=published, notify agent, log |
| AD-04 | Reject listing without reason | block, require reason |
| AD-05 | Request revision | status=revision_requested, notify |
| AD-06 | Unpublish published listing | status=archived, notify |
| AD-07 | Approve agent application | role=agent, notify, profile สร้าง |
| AD-08 | Reject agent app | status=rejected, ไม่เปลี่ยน role |
| AD-09 | Suspend user | login ไม่ได้, 403 |
| AD-10 | Suspend agent | listings ของเขาถูกซ่อน |
| AD-11 | Admin action log | ทุก action มี record |
| AD-12 | Admin A ดูงานของ Admin B | อ่านได้ แต่ไม่แก้ไข |
| AD-13 | Review queue empty state | แสดง "ไม่มีงานรอตรวจ" |
| AD-14 | Bulk approve (ถ้ามี) | atomic, ทั้งหมดผ่าน/ไม่ผ่าน |

---

## 5. Cross-Role Scenarios

### 🎯 Scenario 1: Full Marketplace Transaction
**Actors:** Buyer + Agent + Admin

```
Day 1  | Agent    | สร้างและ submit listing
       | Admin    | Review → Approve
       | Listing  | Goes live
Day 2  | Buyer    | Search AI → พบประกาศ
       | Buyer    | Add favorite + send enquiry
       | Agent    | ได้ notification → ติดต่อกลับ
       | Agent    | Update lead: new → contacted
Day 3  | Buyer    | Book viewing
       | Agent    | Confirm appointment
Day 5  | Both     | พบกันที่ property
       | Agent    | Update lead: viewing_scheduled → negotiating
Day 7  | Buyer    | ชำระมัดจำ
       | Agent    | Update lead: negotiating → won
       | Buyer    | เขียน review
```

### 🎯 Scenario 2: Fraud Detection
**Actors:** Buyer + Admin

```
- Buyer รายงานประกาศ (fake listing)
- Admin ได้ alert
- Admin review → Unpublish listing
- Admin สอบสวน agent
- Suspend agent + refund buyer
- Log ทุก action
```

### 🎯 Scenario 3: User Becomes Agent
**Actors:** User (เดิม) → Agent (ใหม่)

```
- Buyer มี favorites, enquiries, reviews เดิม
- Apply เป็น agent
- Admin approve → role changes
- Data เดิมคงอยู่ (favorites, reviews)
- Now can create listings
- Dual mode: สามารถซื้อและขายได้
```

### 🎯 Scenario 4: Notification Cascade
**Event:** Listing ถูก approve

```
Trigger: Admin approve
  ├─→ Agent: notification "Your listing X is live"
  ├─→ Users with matching saved searches: "New match: X"
  ├─→ Users who favorited similar listings: "You might like X"
  └─→ Analytics event logged
```

---

## 📊 Summary Matrix

| Action | Guest | Buyer | Agent | Admin |
|--------|:-----:|:-----:|:-----:|:-----:|
| ดูหน้าแรก / ค้นหา | ✅ | ✅ | ✅ | ✅ |
| ดูประกาศ published | ✅ | ✅ | ✅ | ✅ |
| Favorite / Wishlist | ❌ | ✅ | ✅ | ✅ |
| ส่ง Enquiry / Appointment | ❌ | ✅ | ❌ | ❌ |
| Write Review | ❌ | ✅ | ✅ | ✅ |
| สร้าง/แก้ไข listing | ❌ | ❌ | ✅ (ของตัวเอง) | ❌ |
| รับ Lead | ❌ | ❌ | ✅ | ❌ |
| อนุมัติประกาศ | ❌ | ❌ | ❌ | ✅ |
| อนุมัติ Agent | ❌ | ❌ | ❌ | ✅ |
| Suspend user | ❌ | ❌ | ❌ | ✅ |
| ดู Audit log | ❌ | ❌ | ❌ | ✅ |

---

## 🎬 Recommended Testing Order

1. **Guest flows** (ง่ายสุด, ไม่ต้อง setup)
2. **Buyer basic** (register + search + favorite)
3. **Agent application** (require buyer account)
4. **Admin approval** (require agent pending)
5. **Full listing lifecycle** (end-to-end)
6. **Cross-role scenarios** (integration)
7. **Edge cases & security** (suspend, IDOR, etc.)

---

> 📝 เอกสารนี้ใช้คู่กับ [USER_JOURNEY_TEST_PLAN.md](./USER_JOURNEY_TEST_PLAN.md) ซึ่งมี Test Case ID ละเอียด
