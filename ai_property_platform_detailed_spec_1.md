# AI-Powered Property Marketplace — Detailed Development Specification

> เอกสารนี้ครอบคลุม Role Journey, Permission Matrix, Feature Interaction, AI System Design และ Technical Implementation Guide ทั้งหมด

---

## สารบัญ

1. [System Overview](#1-system-overview)
2. [Role Definitions & Journeys](#2-role-definitions--journeys)
   - 2.1 User Journey
   - 2.2 Agent Journey
   - 2.3 Admin Journey
3. [Role Interaction Map](#3-role-interaction-map)
4. [Feature Functional Spec](#4-feature-functional-spec)
5. [AI System Design](#5-ai-system-design)
6. [Data Model](#6-data-model)
7. [API Design](#7-api-design)
8. [Frontend Architecture](#8-frontend-architecture)
9. [Security & Permission Matrix](#9-security--permission-matrix)
10. [Error Handling & Edge Cases](#10-error-handling--edge-cases)

---

# 1. System Overview

## 1.1 Platform Purpose

แพลตฟอร์มอสังหาริมทรัพย์ที่ใช้ AI ช่วยให้ผู้ใช้สามารถค้นหาทรัพย์สินด้วยภาษาธรรมชาติ ตีความความต้องการอัตโนมัติ เปรียบเทียบรายการ และรับคำอธิบายที่เหมาะกับความต้องการส่วนตัว โดยแตกต่างจาก DDproperty ตรงที่ผู้ใช้ไม่จำเป็นต้องรู้ทำเลหรือ filter ล่วงหน้า

## 1.2 Core Differentiators

| Feature | DDproperty-style | This Platform |
|---|---|---|
| การค้นหา | Filter-based (เขต, ราคา, ประเภท) | Natural language + AI intent |
| เมื่อข้อมูลไม่ครบ | แสดงผลทั้งหมด | ถามกลับอัตโนมัติ (Clarification) |
| การเปรียบเทียบ | ตารางข้อมูลดิบ | ตาราง + AI Summary ที่โยงกับความต้องการผู้ใช้ |
| ผลการค้นหา | List/Grid + sort | List/Grid + คำอธิบายว่าทำไมตรงกับผู้ใช้ |

## 1.3 Three Core Roles

```
┌─────────────────────────────────────────────────────┐
│                    ADMIN                             │
│  ควบคุมระบบทั้งหมด อนุมัติ Agent และ Listing        │
└───────────────────────┬─────────────────────────────┘
                        │ อนุมัติ / ปฏิเสธ
          ┌─────────────┴──────────────┐
          ▼                            ▼
┌──────────────────┐        ┌──────────────────────┐
│      AGENT       │        │        USER           │
│ ลงประกาศขาย/เช่า │◄──────►│ ค้นหา เปรียบเทียบ    │
│ จัดการ Lead      │  Lead  │ ติดต่อ Agent          │
└──────────────────┘        └──────────────────────┘
```

---

# 2. Role Definitions & Journeys

---

## 2.1 USER JOURNEY

### ความหมายของ Role

User คือผู้ที่ต้องการซื้อหรือเช่าอสังหาริมทรัพย์ ไม่มีสิทธิ์ลงประกาศ แต่สามารถยื่นสมัครเป็น Agent ได้ในภายหลัง

### Journey Map ทั้งหมด

```
[DISCOVERY]
    │
    ├── เข้าหน้าแรก (Homepage)
    │       └── เห็น AI Search Box + Featured Listings
    │
    ├── ค้นหาด้วย AI (AI Intent Search)
    │       ├── พิมพ์ความต้องการภาษาไทย
    │       ├── ระบบถามกลับ (ถ้าข้อมูลไม่พอ)
    │       └── ดูผลลัพธ์พร้อม AI Explanation
    │
    ├── ค้นหาด้วย Filter ปกติ (Traditional Search)
    │       └── เลือก buy/rent, ประเภท, ราคา, เขต, ห้องนอน
    │
[EXPLORATION]
    │
    ├── ดูรายการ (Search Results Page)
    │       ├── List / Map / Grid view
    │       ├── Sort by: ราคา, ใหม่ล่าสุด, ตรงความต้องการ
    │       └── เพิ่มรายการเข้า Compare Tray
    │
    ├── ดูรายละเอียด (Listing Detail Page)
    │       ├── รูปภาพ, ข้อมูลทรัพย์
    │       ├── ที่ตั้งบนแผนที่
    │       ├── ข้อมูล Agent
    │       └── Save to Favorites
    │
    ├── เปรียบเทียบ (Compare Page)
    │       ├── เลือก 2-5 รายการ
    │       ├── ดูตารางเปรียบเทียบ field-by-field
    │       └── อ่าน AI Summary ว่าอันไหนเหมาะที่สุด
    │
[CONVERSION]
    │
    ├── ส่ง Enquiry หา Agent
    │       ├── กรอกชื่อ เบอร์ โทร ข้อความ
    │       └── รอ Agent ติดต่อกลับ
    │
    └── สมัครสมาชิก / เข้าสู่ระบบ (เพื่อบันทึก Favorites, ดู Enquiry History)
```

### User Feature Detail

#### 1. การสมัครและเข้าสู่ระบบ

| Action | Description | Required |
|---|---|---|
| Register | อีเมล + รหัสผ่าน หรือ Google OAuth | ไม่บังคับสำหรับดู listing |
| Login | Session-based หรือ JWT | ต้องการสำหรับ Favorites, Enquiry |
| Email Verify | ยืนยันอีเมลก่อนใช้ฟีเจอร์บางส่วน | ใช่ |
| Forgot Password | Reset ผ่านอีเมล | ใช่ |
| OAuth (Google) | Sign in with Google | Optional |

**เงื่อนไข:** ผู้ใช้ไม่จำเป็นต้อง login เพื่อค้นหาหรือดู listing แต่ต้อง login เพื่อ save favorites หรือส่ง enquiry

#### 2. AI Intent Search — User Flow ละเอียด

```
Step 1: User เปิดหน้าแรก
        └── เห็น AI Search Box ที่ด้านบนสุด

Step 2: User พิมพ์ข้อความ
        ตัวอย่าง: "อยากได้คอนโดใกล้ BTS ไม่เกิน 3 ล้าน 1 ห้องนอน"

Step 3: ระบบส่ง request ไป Backend → Gemini API
        └── Parse Intent → ได้ JSON structured data

Step 4A: ถ้าข้อมูลครบ (มี buy/rent + budget + location)
         └── Query DB → แสดงผลทันที

Step 4B: ถ้าข้อมูลไม่ครบ
         └── Gemini สร้างคำถามกลับ
             ตัวอย่าง: "กำลังมองจะซื้อหรือเช่าอยู่ครับ?"
             └── User ตอบ → กลับไป Step 3

Step 5: แสดงผลลัพธ์
        ├── Listing cards พร้อม "ทำไมตรงกับคุณ" badge
        └── AI Explanation ว่าระบบตีความอะไรออกมาบ้าง
```

#### 3. Compare Listings — User Flow ละเอียด

```
Step 1: User กด "เปรียบเทียบ" บน listing card (หลังๆ จะมี tray ด้านล่าง)
        └── Compare Tray ปรากฏที่ด้านล่างหน้าจอ

Step 2: User เพิ่ม listing เข้า tray ได้ 2-5 รายการ
        └── ถ้าเกิน 5 รายการ: แจ้งเตือน "เลือกได้สูงสุด 5 รายการ"

Step 3: กด "เปรียบเทียบเลย"
        └── ไปหน้า Compare Page

Step 4: หน้า Compare แสดง
        ├── ตารางเปรียบเทียบ field-by-field
        │       ├── ราคา
        │       ├── ขนาด
        │       ├── ห้องนอน / ห้องน้ำ
        │       ├── ที่จอดรถ
        │       ├── เฟอร์นิเจอร์
        │       └── ระยะห่างจาก BTS/MRT
        │
        └── AI Summary Section
                ├── "สรุป: ห้อง A เหมาะกับคุณที่สุดเพราะ..."
                ├── Best Overall / Best for Budget / Best for Commute
                └── Pros & Cons แต่ละรายการ
```

#### 4. Enquiry — User Flow ละเอียด

```
Step 1: User กด "ติดต่อ Agent" บนหน้า Listing Detail

Step 2: กรอก Enquiry Form
        ├── ชื่อ-นามสกุล (required)
        ├── เบอร์โทรศัพท์ (required)
        ├── อีเมล (required ถ้าไม่ได้ login)
        ├── ข้อความ (optional, มี default template)
        └── เวลาที่สะดวกติดต่อ (optional)

Step 3: กด Submit
        ├── สร้าง Lead ใน DB (status: "new")
        ├── แจ้งเตือน Agent (Email + In-app notification)
        └── User เห็น confirmation หน้าจอ

Step 4: User สามารถดู Enquiry History ได้ใน Profile
        └── เห็นสถานะ: new → contacted → viewing_scheduled → ...
```

---

## 2.2 AGENT JOURNEY

### ความหมายของ Role

Agent คือนายหน้าหรือเจ้าของอสังหาที่ผ่านการยืนยันตัวตนจาก Admin แล้ว มีสิทธิ์ลงประกาศและรับ Lead จาก User

### Journey Map ทั้งหมด

```
[ONBOARDING]
    │
    ├── สมัครสมาชิกเป็น User ก่อน
    │
    ├── ยื่นสมัครเป็น Agent
    │       ├── กรอก Agent Application Form
    │       ├── แนบเอกสาร (ใบอนุญาตนายหน้า, บัตรประชาชน)
    │       └── รอ Admin อนุมัติ
    │
    └── ได้รับ Email แจ้งผล (อนุมัติ / ปฏิเสธ / ขอข้อมูลเพิ่ม)

[LISTING MANAGEMENT]
    │
    ├── สร้างประกาศ (Create Listing)
    │       ├── กรอกข้อมูลทรัพย์
    │       ├── อัปโหลดรูปภาพ
    │       ├── บันทึก Draft
    │       └── ส่งรออนุมัติ (Submit for Review)
    │
    ├── จัดการประกาศ (Manage Listings)
    │       ├── ดู Listing ทั้งหมดของตัวเอง
    │       ├── แก้ไขประกาศ
    │       ├── ปิดประกาศ (Mark Unavailable)
    │       └── ลบ Draft
    │
[LEAD MANAGEMENT]
    │
    ├── รับ Enquiry จาก User
    │       ├── เห็น Lead Inbox (notification badge)
    │       └── ดูรายละเอียด: User contact, ทรัพย์ที่สนใจ, ข้อความ
    │
    ├── อัปเดตสถานะ Lead
    │       └── new → contacted → viewing_scheduled → negotiating → won/lost
    │
    └── ดู Analytics
            ├── จำนวน View ของแต่ละ Listing
            ├── จำนวน Enquiry ที่ได้รับ
            └── Conversion Rate
```

### Agent Feature Detail

#### 1. Agent Application Flow

```
User เปิด "สมัครเป็น Agent"
        │
        ▼
กรอก Agent Application Form:
├── ชื่อ-นามสกุล จริง
├── ชื่อบริษัท/นามแฝง (optional)
├── เบอร์โทรที่ติดต่อได้
├── ประสบการณ์ (จำนวนปี, ย่านที่เชี่ยวชาญ)
├── ใบอนุญาตนายหน้า (upload)
└── สำเนาบัตรประชาชน (upload)
        │
        ▼
สถานะ: "pending_review"
        │
        ▼
Admin พิจารณา:
├── Approve → สถานะ: "approved" → User ได้รับ role "agent"
├── Reject → สถานะ: "rejected" + เหตุผล
└── Request More Info → สถานะ: "info_requested" → User อัปโหลดเพิ่ม
```

**ข้อมูลที่เก็บใน agent_applications:**

```sql
id, user_id, full_name, company_name, phone,
experience_years, expertise_areas[],
license_document_url, id_document_url,
status (pending/approved/rejected/info_requested),
admin_note, reviewed_by, reviewed_at,
created_at, updated_at
```

#### 2. Listing Creation — Agent Flow ละเอียด

```
Step 1: Agent กด "ลงประกาศใหม่"

Step 2: กรอก Listing Form (แบ่งเป็น Steps)
        
        [Step A - ข้อมูลพื้นฐาน]
        ├── listing_type: ขาย / เช่า
        ├── property_type: คอนโด / บ้านเดี่ยว / ทาวน์เฮาส์ / ที่ดิน
        ├── title (ชื่อประกาศ)
        └── description (รายละเอียด)
        
        [Step B - ราคาและขนาด]
        ├── ราคา (บาท)
        ├── ขนาดใช้สอย (ตร.ม.)
        ├── ห้องนอน
        ├── ห้องน้ำ
        ├── ที่จอดรถ
        └── ชั้น (สำหรับคอนโด)
        
        [Step C - สิ่งอำนวยความสะดวก]
        ├── furnishing: เฟอร์นิเจอร์ครบ / บางส่วน / ไม่มี
        ├── amenities: สระว่ายน้ำ, ฟิตเนส, รักษาความปลอดภัย...
        └── nearby: BTS/MRT ที่ใกล้ที่สุด + ระยะทาง
        
        [Step D - ที่ตั้ง]
        ├── เขต / จังหวัด
        ├── ชื่อโครงการ
        └── Pin on Map (lat/lng)
        
        [Step E - รูปภาพ]
        ├── อัปโหลดรูปภาพ (สูงสุด 20 รูป)
        └── เลือกรูป Cover

Step 3: บันทึก Draft หรือ Submit for Review

Step 4: Admin พิจารณา (ดูในส่วน Admin Journey)

Step 5: เมื่ออนุมัติ → Listing แสดงบน Platform
```

**Listing Status Flow:**

```
draft → pending_review → approved (published)
                      → rejected → draft (แก้ไขใหม่)
                      → revision_requested → pending_review
published → unavailable (ปิดชั่วคราว)
         → sold/rented (ปิดถาวร)
```

#### 3. Lead Management — Agent Flow ละเอียด

```
[Receive Lead]
Agent ได้รับ notification (Email + In-app)
        └── Lead Inbox แสดง:
                ├── ชื่อ User ที่ติดต่อมา
                ├── Listing ที่สนใจ
                ├── วันเวลาที่ส่ง Enquiry
                ├── ข้อความจาก User
                └── เบอร์โทร / อีเมล User

[Manage Lead]
Agent กดเข้าดู Lead Detail
        ├── เห็น Timeline ประวัติ interaction
        ├── Update Status:
        │       new → contacted → viewing_scheduled → negotiating → won/lost/spam
        │
        ├── เพิ่ม Notes ส่วนตัว (ไม่แสดงให้ User เห็น)
        └── Schedule Viewing (อนาคต)
```

**Lead Status ความหมาย:**

| Status | ความหมาย | Action ที่ควรทำ |
|---|---|---|
| new | Enquiry ใหม่ที่ยังไม่ได้อ่าน | โทรหา User ภายใน 24 ชม. |
| contacted | ติดต่อ User แล้ว | นัดดูทรัพย์ |
| viewing_scheduled | นัดดูทรัพย์แล้ว | ยืนยัน appointment |
| negotiating | กำลังต่อรองราคา | รอผล |
| won | ปิดการขาย/เช่าสำเร็จ | — |
| lost | ไม่สำเร็จ | บันทึกเหตุผล |
| spam | Enquiry ไม่จริง | Report |

---

## 2.3 ADMIN JOURNEY

### ความหมายของ Role

Admin คือผู้ดูแลระบบ มีสิทธิ์สูงสุด ดูแล Quality ของ Listing, อนุมัติ Agent, จัดการ User, ปรับแต่ง AI และดู Analytics ทั้งระบบ

### Journey Map ทั้งหมด

```
[USER MANAGEMENT]
    │
    ├── ดู User ทั้งหมด
    ├── Suspend / Unsuspend Account
    └── ดูประวัติ Activity

[AGENT MANAGEMENT]
    │
    ├── Review Agent Applications
    │       ├── ดูเอกสารที่แนบมา
    │       ├── Approve / Reject / Request More Info
    │       └── ส่ง Email แจ้งผล
    │
    └── จัดการ Active Agents
            ├── Revoke Agent Status
            └── ดู Performance ของแต่ละ Agent

[LISTING MODERATION]
    │
    ├── Review Queue (ประกาศรอการอนุมัติ)
    │       ├── ตรวจสอบความถูกต้อง
    │       ├── Approve / Reject / Request Revision
    │       └── เพิ่ม Internal Note
    │
    └── จัดการ Published Listings
            ├── Force Unpublish ถ้าผิด Policy
            └── Flag ว่าเป็นข้อมูลซ้ำ

[AI & SEARCH MANAGEMENT]
    │
    ├── ดู AI Search Analytics
    │       ├── คำค้นยอดนิยม
    │       ├── Intent ที่ parse บ่อย
    │       └── No-result queries
    │
    ├── จัดการ Synonym Mappings
    │       ตัวอย่าง: "แถวอโศก" = ["อโศก", "สุขุมวิท 21", "พร้อมพงษ์"]
    │
    └── ปรับ Ranking Weights

[SYSTEM ANALYTICS]
    │
    ├── Dashboard: Listing count, Active agents, Daily enquiries
    ├── Revenue Reports (หลัง Phase 6)
    └── Data Quality Reports
```

### Admin Feature Detail

#### 1. Agent Application Review — Admin Flow

```
Admin เปิด "Agent Applications" หน้า
        │
        ▼
เห็น Queue แบ่งตาม Status:
├── Pending (ใหม่ รอพิจารณา)
├── Info Requested (รอ Agent ส่งข้อมูลเพิ่ม)
└── Reviewed Today (พิจารณาแล้ววันนี้)

        │
        ▼
กดเข้า Application Detail:
├── ข้อมูล Agent ที่กรอกมา
├── เอกสารที่แนบ (viewer inline)
├── ประวัติ User Account (สมัครเมื่อไหร่, activity)
└── Action Panel:
        ├── [Approve] → role เปลี่ยนเป็น agent + Email แจ้ง
        ├── [Reject] → กรอกเหตุผล + Email แจ้ง
        └── [Request More Info] → กรอกสิ่งที่ต้องการ + Email แจ้ง
```

#### 2. Listing Moderation — Admin Flow

```
Admin เปิด "Listing Review Queue"
        │
        ▼
เห็น Listings รอการอนุมัติ:
├── รูป Cover + ชื่อประกาศ
├── ชื่อ Agent ที่ส่งมา
├── วันที่ส่ง
└── Priority flag (ถ้า Agent มี paid package)

        │
        ▼
กดเข้า Listing Detail (Admin View):
├── ดูข้อมูลทั้งหมดเหมือน User เห็น
├── ดู Internal Data (lat/lng, raw fields)
├── ดู Agent Profile ที่ส่งมา
└── Action Panel:
        ├── [Approve] → status = published
        ├── [Reject] → กรอกเหตุผล + Email Agent
        └── [Request Revision] → ระบุ field ที่ต้องแก้ + Email Agent

Checklist ที่ Admin ควรตรวจ:
☐ รูปภาพชัดเจน ไม่มีลายน้ำซ้ำซ้อน
☐ ราคาสมเหตุสมผลกับทำเล
☐ ข้อมูลสำคัญครบ (ขนาด, ห้องนอน, ที่ตั้ง)
☐ พิกัด Map ถูกต้อง
☐ ไม่ใช่ประกาศซ้ำ (ระบบ flag อัตโนมัติ)
☐ ไม่มีข้อมูลติดต่อซ่อนอยู่ในรูปภาพ (bypass lead system)
```

---

# 3. Role Interaction Map

## 3.1 ภาพรวมความสัมพันธ์

```
                    ┌─────────────────┐
                    │      ADMIN      │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │ อนุมัติ Agent │              │ Moderate Listing
              ▼              │              ▼
    ┌──────────────────┐     │    ┌──────────────────┐
    │   USER (applying │     │    │     LISTING       │
    │   to be Agent)   │     │    │   (content unit)  │
    └────────┬─────────┘     │    └────────┬──────────┘
             │               │             │
             │ Approved       │             │ Published
             ▼               │             ▼
    ┌──────────────────┐     │    ┌──────────────────┐
    │      AGENT       │─────┘    │      USER         │
    │   (creates       │ owns     │  (searches,       │
    │    listings)     │◄────────►│   enquires,       │
    └──────────────────┘  Lead    │   compares)       │
                                  └──────────────────┘
```

## 3.2 Interaction Matrix แต่ละ Feature

### Feature: Listing

| Action | User | Agent | Admin | ระบบอัตโนมัติ |
|---|---|---|---|---|
| ดู Listing | ✅ | ✅ | ✅ | — |
| สร้าง Listing | ❌ | ✅ | ❌ | — |
| แก้ไข Listing (ตัวเอง) | ❌ | ✅ | ❌ | — |
| ส่ง Listing รออนุมัติ | ❌ | ✅ | ❌ | — |
| Approve/Reject Listing | ❌ | ❌ | ✅ | — |
| Force Unpublish | ❌ | ❌ | ✅ | — |
| Auto-flag duplicate | ❌ | ❌ | ❌ | ✅ |

### Feature: Enquiry/Lead

| Action | User | Agent | Admin | ระบบ |
|---|---|---|---|---|
| ส่ง Enquiry | ✅ | ❌ | ❌ | — |
| รับ/อ่าน Enquiry (ของตัวเอง) | ❌ | ✅ | ❌ | — |
| Update Lead Status | ❌ | ✅ | ❌ | — |
| ดู Lead ทั้งหมด | ❌ | ❌ | ✅ | — |
| แจ้งเตือน Agent | ❌ | ❌ | ❌ | ✅ |

### Feature: AI Search

| Action | User | Agent | Admin | ระบบ |
|---|---|---|---|---|
| ใช้ AI Search | ✅ | ✅ | ❌ | — |
| ดู Search Analytics | ❌ | ❌ | ✅ | — |
| ปรับ AI Config | ❌ | ❌ | ✅ | — |
| Parse Intent | ❌ | ❌ | ❌ | ✅ |
| Generate Clarification | ❌ | ❌ | ❌ | ✅ |

### Feature: Agent Application

| Action | User | Agent | Admin | ระบบ |
|---|---|---|---|---|
| ยื่นสมัคร Agent | ✅ | ❌ | ❌ | — |
| Review Application | ❌ | ❌ | ✅ | — |
| Approve → เปลี่ยน Role | ❌ | ❌ | ✅ | ✅ |
| Email แจ้งผล | ❌ | ❌ | ❌ | ✅ |

## 3.3 Cross-Role Data Flow

### Flow: User ส่ง Enquiry → Agent จัดการ → Admin ดูภาพรวม

```
[USER]                    [SYSTEM]                [AGENT]             [ADMIN]
   │                          │                       │                   │
   │──ส่ง Enquiry Form──────►│                       │                   │
   │                          │──สร้าง Lead (new)───►│                   │
   │                          │──Email notification──►│                   │
   │                          │                       │──อ่าน Lead──────►│(ดูได้)
   │                          │                       │──Update status───►│(ดูได้)
   │◄─Status update visible───│◄──status: contacted───│                   │
   │                          │                       │                   │
```

### Flow: Agent ลงประกาศ → Admin อนุมัติ → User เห็น

```
[AGENT]              [SYSTEM]                  [ADMIN]           [USER]
   │                     │                         │                 │
   │──Create Listing────►│                         │                 │
   │──Submit Review─────►│──เพิ่มใน Queue─────────►│                 │
   │                     │──Email to Admin─────────►│                 │
   │                     │                         │──Review──────►  │
   │                     │◄────────────────Approve─│                 │
   │◄──Email approved────│──status: published──────────────────────►│(เห็น)
   │                     │                         │                 │
```

---

# 4. Feature Functional Spec

## 4.1 Authentication & Session Management

### Registration Flow

```
1. กรอก email + password
2. Validate: email format, password strength (min 8 chars, 1 uppercase, 1 number)
3. Check duplicate email
4. สร้าง user record (role: "user", status: "pending_verification")
5. ส่ง verification email (token มีอายุ 24 ชม.)
6. User กดลิงก์ใน email → status: "active"
```

### Session Strategy

- **JWT + HttpOnly Cookie** สำหรับ Web
- Access Token: 15 นาที
- Refresh Token: 7 วัน (rotate on use)
- Redis เก็บ Refresh Token Blacklist (สำหรับ logout)

### Role Middleware (Next.js)

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')
  const pathname = request.nextUrl.pathname

  // Routes ที่ต้องการ role
  const agentRoutes = ['/agent/listings', '/agent/leads', '/agent/analytics']
  const adminRoutes = ['/admin']
  const authRoutes = ['/favorites', '/enquiries']

  if (agentRoutes.some(r => pathname.startsWith(r))) {
    if (!token || !hasRole(token, 'agent')) {
      return NextResponse.redirect('/login?reason=agent_required')
    }
  }
  // ... similar for admin and auth routes
}
```

## 4.2 Listing Schema (Complete)

```typescript
interface Listing {
  // Identity
  id: string
  agent_id: string
  status: 'draft' | 'pending_review' | 'published' | 'rejected' |
          'revision_requested' | 'unavailable' | 'sold' | 'rented'

  // Classification
  listing_type: 'sale' | 'rent'
  property_type: 'condo' | 'house' | 'townhouse' | 'land' | 'commercial'

  // Basic Info
  title: string
  description: string
  price: number
  price_unit: 'total' | 'per_month' | 'per_sqm'

  // Physical Attributes
  usable_area: number        // ตร.ม.
  land_area?: number         // ไร่-งาน-วา (สำหรับบ้าน/ที่ดิน)
  bedrooms: number
  bathrooms: number
  parking_spaces: number
  floor?: number             // ชั้นที่ (สำหรับคอนโด)
  total_floors?: number      // จำนวนชั้นทั้งหมดของอาคาร
  furnishing: 'fully_furnished' | 'partially_furnished' | 'unfurnished'

  // Location
  project_name?: string
  district: string
  province: string
  latitude: number
  longitude: number
  address_detail?: string

  // Nearby Transit
  nearest_bts?: string       // ชื่อสถานี BTS ที่ใกล้สุด
  nearest_bts_distance?: number  // เมตร
  nearest_mrt?: string
  nearest_mrt_distance?: number
  nearest_arl?: string
  nearest_arl_distance?: number

  // Media
  cover_image_url: string
  images: ListingImage[]
  video_url?: string
  virtual_tour_url?: string

  // Amenities (เก็บเป็น array of keys)
  amenities: string[]
  // เช่น: ['swimming_pool', 'gym', 'security_24h', 'playground', 'parking']

  // AI-searchable fields
  lifestyle_tags: string[]
  // เช่น: ['pet_friendly', 'near_school', 'quiet_neighborhood']

  // Admin
  admin_note?: string
  reviewed_by?: string
  reviewed_at?: Date
  rejection_reason?: string

  // Timestamps
  created_at: Date
  updated_at: Date
  published_at?: Date
}
```

## 4.3 Search & Filter System

### Traditional Filter → Query Mapping

```typescript
interface SearchFilters {
  listing_type?: 'sale' | 'rent'
  property_types?: string[]
  price_min?: number
  price_max?: number
  bedrooms_min?: number
  bedrooms_max?: number
  bathrooms_min?: number
  districts?: string[]
  province?: string
  project_name?: string
  amenities?: string[]
  furnishing?: string[]
  usable_area_min?: number
  usable_area_max?: number
  sort_by?: 'price_asc' | 'price_desc' | 'newest' | 'relevance'
  page?: number
  limit?: number
}
```

### Prisma Query Builder จาก Filters

```typescript
async function buildSearchQuery(filters: SearchFilters) {
  const where: Prisma.ListingWhereInput = {
    status: 'published',
    ...(filters.listing_type && { listing_type: filters.listing_type }),
    ...(filters.property_types?.length && {
      property_type: { in: filters.property_types }
    }),
    ...(filters.price_min || filters.price_max) && {
      price: {
        ...(filters.price_min && { gte: filters.price_min }),
        ...(filters.price_max && { lte: filters.price_max })
      }
    },
    ...(filters.districts?.length && {
      district: { in: filters.districts }
    }),
    // ... etc
  }

  return prisma.listing.findMany({
    where,
    orderBy: buildOrderBy(filters.sort_by),
    skip: ((filters.page ?? 1) - 1) * (filters.limit ?? 20),
    take: filters.limit ?? 20,
    include: { images: true, agent: { include: { profile: true } } }
  })
}
```

---

# 5. AI System Design

## 5.1 Architecture ของ AI Layer

```
┌──────────────────────────────────────────────────────────────┐
│                        AI Pipeline                           │
│                                                              │
│  User Input                                                  │
│      │                                                       │
│      ▼                                                       │
│  ┌─────────────────────────────────────┐                     │
│  │   1. Intent Extraction Engine       │ ← Gemini API       │
│  │      - Parse Thai natural language  │                     │
│  │      - Output: ParsedIntent JSON    │                     │
│  └──────────────┬──────────────────────┘                     │
│                 │                                            │
│      ┌──────────▼──────────┐                                │
│      │ Missing Fields?     │                                │
│      └──┬───────────────┬──┘                                │
│         │ YES            │ NO                               │
│         ▼               ▼                                   │
│  ┌────────────┐  ┌────────────────────┐                     │
│  │ 2.Clarify  │  │ 3. Query Builder   │                     │
│  │ Question   │  │    (Prisma Query)   │                     │
│  │ Generator  │  └────────┬───────────┘                     │
│  └─────┬──────┘           │                                 │
│        │ return           ▼                                 │
│        │ question  ┌────────────────┐                       │
│        │           │ 4. DB Fetch    │                       │
│        │           └────────┬───────┘                       │
│        │                    ▼                               │
│        │           ┌────────────────────┐                   │
│        │           │ 5. Explanation     │ ← Gemini API     │
│        │           │    Generator       │                   │
│        │           └────────┬───────────┘                   │
│        │                    │                               │
│        └────────────────────┤                               │
│                             ▼                               │
│                    Response to User                         │
└──────────────────────────────────────────────────────────────┘
```

## 5.2 Gemini Client Setup

```typescript
// lib/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// สำหรับงานที่ต้องการ JSON (Intent, Compare Summary)
export const geminiJSON = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig: {
    responseMimeType: "application/json",
    temperature: 0.1,   // ต่ำ = deterministic, แม่นยำ
    maxOutputTokens: 1024,
  },
})

// สำหรับงานที่ต้องการ Text (Clarification Question, Explanation)
export const geminiText = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig: {
    responseMimeType: "text/plain",
    temperature: 0.4,   // สูงขึ้นเล็กน้อยเพื่อให้ภาษาเป็นธรรมชาติ
    maxOutputTokens: 256,
  },
})
```

## 5.3 Intent Extraction Engine (รายละเอียดเต็ม)

### ParsedIntent Schema

```typescript
// lib/ai/types.ts
export interface ParsedIntent {
  // Core Fields (Required for search)
  search_goal: 'buy' | 'rent' | null
  budget_min: number | null           // บาท
  budget_max: number | null           // บาท
  location_context: string | null     // เช่น "ใกล้ BTS อโศก", "แถวพระราม 9"

  // Property Preferences
  property_types: PropertyType[]
  bedrooms: number | null
  bedrooms_flexible: boolean          // "อย่างน้อย 2 ห้อง" = bedrooms:2, flexible:true
  bathrooms: number | null
  usable_area_min: number | null      // ตร.ม.

  // Lifestyle & Context
  transit_preference: TransitLine[]   // ['BTS', 'MRT', 'ARL']
  preferred_stations: string[]        // ['อโศก', 'พร้อมพงษ์']
  preferred_districts: string[]       // ['วัฒนา', 'คลองเตย']
  furnishing_preference: 'fully_furnished' | 'partially_furnished' | 'unfurnished' | null
  lifestyle_tags: string[]            // ['pet_friendly', 'near_school']
  move_in_urgency: 'immediate' | 'within_month' | 'flexible' | null

  // Purpose (ช่วย rank)
  purpose_context: 'investment' | 'own_use' | 'rental_income' | null

  // AI Confidence
  confidence_score: number            // 0-1
  missing_required_fields: MissingField[]
  // MissingField = 'search_goal' | 'budget' | 'location'
  
  // Raw interpretation (สำหรับ debug/display)
  interpreted_as: string             // "กำลังมองหาคอนโดซื้อ ราคาไม่เกิน 3 ล้าน ใกล้ BTS"
}
```

### Intent Parser Function

```typescript
// lib/ai/intentParser.ts
import { geminiJSON } from "@/lib/gemini"
import { ParsedIntent } from "./types"

const INTENT_SYSTEM_PROMPT = `
คุณคือ AI ผู้เชี่ยวชาญในการวิเคราะห์ความต้องการอสังหาริมทรัพย์จากข้อความภาษาไทย

กฎการแปลงค่า:
- "3 ล้าน" หรือ "3M" = 3000000
- "15,000 บาท/เดือน" = budget_max: 15000 (สำหรับ rent)
- "ไม่เกิน X" = budget_max: X
- "อย่างน้อย X ห้องนอน" = bedrooms: X, bedrooms_flexible: true
- "ใกล้ BTS" = transit_preference: ["BTS"]
- ชื่อสถานี BTS/MRT ให้เก็บใน preferred_stations

confidence_score:
- 0.9+ = มีข้อมูลครบ ค้นหาได้ทันที
- 0.6-0.9 = ข้อมูลพอสมควร แต่อาจถามเพิ่ม
- < 0.6 = ข้อมูลไม่เพียงพอ ต้องถามก่อน

missing_required_fields rules:
- ใส่ "search_goal" ถ้าไม่รู้ว่าซื้อหรือเช่า
- ใส่ "budget" ถ้าไม่มีข้อมูลงบประมาณเลย
- ใส่ "location" ถ้าไม่มีข้อมูลทำเลเลย

ห้ามเดาข้อมูลที่ไม่มีในข้อความ ให้ใส่ null แทน
`

export async function parsePropertyIntent(
  userMessage: string,
  sessionContext?: ParsedIntent  // Previous intent ในกรณีที่ตอบ clarification
): Promise<ParsedIntent> {
  const contextStr = sessionContext
    ? `\nข้อมูลที่ทราบแล้วจากการสนทนาก่อนหน้า:\n${JSON.stringify(sessionContext, null, 2)}`
    : ''

  const prompt = `
${INTENT_SYSTEM_PROMPT}
${contextStr}

ข้อความล่าสุดจากผู้ใช้: "${userMessage}"

Return JSON ตาม ParsedIntent schema อย่างเคร่งครัด
`

  try {
    const result = await geminiJSON.generateContent(prompt)
    const text = result.response.text()
    const parsed = JSON.parse(text) as ParsedIntent
    
    // Merge กับ session context ถ้ามี
    if (sessionContext) {
      return mergeIntents(sessionContext, parsed)
    }
    return parsed
  } catch (error) {
    console.error('Intent parsing failed:', error)
    // Return empty intent ถ้า fail
    return createEmptyIntent()
  }
}

// Merge intent ใหม่กับ intent เดิม (ไม่ทับ field ที่มีอยู่แล้ว)
function mergeIntents(existing: ParsedIntent, newIntent: ParsedIntent): ParsedIntent {
  return {
    ...existing,
    ...Object.fromEntries(
      Object.entries(newIntent).filter(([_, v]) => v !== null && v !== undefined)
    ),
    // Array fields: merge ไม่ทับ
    property_types: [...new Set([...existing.property_types, ...newIntent.property_types])],
    transit_preference: [...new Set([...existing.transit_preference, ...newIntent.transit_preference])],
    preferred_stations: [...new Set([...existing.preferred_stations, ...newIntent.preferred_stations])],
    // Recalculate missing fields
    missing_required_fields: calculateMissingFields(newIntent)
  }
}
```

## 5.4 Clarification Flow Engine

### หลักการ

1. ถามทีละ 1 คำถามเท่านั้น (ไม่ถามหลายอย่างพร้อมกัน)
2. ถามตามลำดับความสำคัญ: search_goal → budget → location
3. มี Quick Reply Suggestions เพื่อลด friction
4. หลัง 2 รอบยังไม่ได้ข้อมูล → ค้นหาด้วยข้อมูลที่มีแล้วก็ได้

### Clarification Generator

```typescript
// lib/ai/clarification.ts
import { geminiText } from "@/lib/gemini"

const FIELD_PRIORITY: MissingField[] = ['search_goal', 'budget', 'location']

interface ClarificationResult {
  question: string
  quick_replies: string[]    // ตัวเลือก shortcut สำหรับ User กด
  field_asking_about: string
}

export async function generateClarification(
  missingFields: MissingField[],
  userMessage: string,
  sessionContext: Partial<ParsedIntent>
): Promise<ClarificationResult> {
  
  // หา field ที่สำคัญที่สุด
  const targetField = FIELD_PRIORITY.find(f => missingFields.includes(f)) ?? missingFields[0]

  // Quick replies ตาม field
  const quickRepliesMap: Record<string, string[]> = {
    search_goal: ['🏠 ซื้อ', '🔑 เช่า'],
    budget: ['ต่ำกว่า 2 ล้าน', '2-5 ล้าน', '5-10 ล้าน', '10 ล้านขึ้นไป'],
    location: ['ใกล้ BTS', 'ใกล้ MRT', 'กรุงเทพกลาง', 'กรุงเทพรอบนอก'],
  }

  const prompt = `
คุณคือ AI ผู้ช่วยหาบ้าน ผู้ใช้พิมพ์ว่า: "${userMessage}"

ข้อมูลที่ทราบแล้ว: ${JSON.stringify(sessionContext)}
ต้องการข้อมูลเพิ่มเติม: "${targetField}"

สร้างคำถาม 1 ข้อ ภาษาไทย เป็นกันเอง สั้น ไม่เกิน 20 คำ
ห้ามถามหลายเรื่องพร้อมกัน
Return: คำถามเป็น plain text เท่านั้น
`

  const result = await geminiText.generateContent(prompt)
  const question = result.response.text().trim()

  return {
    question,
    quick_replies: quickRepliesMap[targetField] ?? [],
    field_asking_about: targetField
  }
}
```

### Clarification State Machine

```
State: INITIAL
       │
       │ User Input
       ▼
State: PARSING
       │
       ├── missing_required_fields.length === 0 → State: SEARCHING
       │
       └── missing_required_fields.length > 0
               │
               ├── clarification_count < 2 → State: CLARIFYING
               │       │ User answers
               │       └── Back to PARSING (with merged context)
               │
               └── clarification_count >= 2 → State: SEARCHING (force, best effort)
```

## 5.5 Query Builder (Intent → Prisma)

```typescript
// lib/ai/queryBuilder.ts
import { ParsedIntent } from "./types"

export function buildPrismaQuery(intent: ParsedIntent) {
  const where: any = {
    status: 'published',
  }

  // Required fields
  if (intent.search_goal) {
    where.listing_type = intent.search_goal === 'buy' ? 'sale' : 'rent'
  }

  if (intent.budget_max) {
    where.price = { ...where.price, lte: intent.budget_max }
  }
  if (intent.budget_min) {
    where.price = { ...where.price, gte: intent.budget_min }
  }

  // Property type
  if (intent.property_types.length > 0) {
    where.property_type = { in: intent.property_types }
  }

  // Bedrooms
  if (intent.bedrooms) {
    if (intent.bedrooms_flexible) {
      where.bedrooms = { gte: intent.bedrooms }
    } else {
      where.bedrooms = intent.bedrooms
    }
  }

  // Location - ใช้ district หรือ fuzzy match ด้วย project_name
  if (intent.preferred_districts.length > 0) {
    where.district = { in: intent.preferred_districts }
  }

  // Transit - filter listing ที่มี station ที่กล่าวถึง
  if (intent.preferred_stations.length > 0) {
    where.OR = intent.preferred_stations.map(station => ({
      OR: [
        { nearest_bts: { contains: station } },
        { nearest_mrt: { contains: station } },
      ]
    }))
  }

  // Lifestyle tags
  if (intent.lifestyle_tags.length > 0) {
    where.lifestyle_tags = { hasSome: intent.lifestyle_tags }
  }

  return {
    where,
    orderBy: buildRankingOrder(intent),
    take: 20,
    include: {
      images: { take: 5 },
      agent: { include: { profile: true } }
    }
  }
}

function buildRankingOrder(intent: ParsedIntent) {
  // Simple ranking: ถ้ามี budget → เรียงจากใกล้ budget ที่สุด
  // Phase 4 จะใช้ weighted scoring ที่ซับซ้อนกว่านี้
  if (intent.budget_max) {
    return [{ price: 'asc' as const }]
  }
  return [{ published_at: 'desc' as const }]
}
```

## 5.6 Search Result Explanation Generator

```typescript
// lib/ai/explainer.ts
import { geminiText } from "@/lib/gemini"

export async function generateSearchExplanation(
  intent: ParsedIntent,
  resultsCount: number
): Promise<string> {
  const prompt = `
ผู้ใช้ค้นหา: ${intent.interpreted_as}
พบผลลัพธ์: ${resultsCount} รายการ

สร้างประโยคสั้นๆ 1-2 ประโยค ภาษาไทย อธิบายว่าระบบค้นหาอะไร
ตัวอย่าง: "พบ 12 คอนโดสำหรับซื้อ ราคาไม่เกิน 3 ล้าน ใกล้ BTS ในกรุงเทพ"

Return plain text เท่านั้น
`

  const result = await geminiText.generateContent(prompt)
  return result.response.text().trim()
}

// Per-listing explanation (ทำไม listing นี้ตรงกับ user)
export async function generateListingMatchReason(
  intent: ParsedIntent,
  listing: any
): Promise<string> {
  const prompt = `
ความต้องการของผู้ใช้: ${JSON.stringify(intent)}
ข้อมูล listing: ${JSON.stringify({
  price: listing.price,
  bedrooms: listing.bedrooms,
  district: listing.district,
  nearest_bts: listing.nearest_bts,
  nearest_bts_distance: listing.nearest_bts_distance,
  property_type: listing.property_type,
})}

อธิบาย 1 ประโยคสั้นๆ ว่า listing นี้ตรงกับความต้องการผู้ใช้ยังไง
เช่น: "ราคาอยู่ในงบ ห่าง BTS เพียง 200 ม."
Return plain text เท่านั้น
`

  const result = await geminiText.generateContent(prompt)
  return result.response.text().trim()
}
```

## 5.7 Compare AI Summary

### Compare Flow

```
User เลือก 2-5 listings → กด Compare
        │
        ▼
Backend รับ listing IDs + session intent
        │
        ▼
Normalize listing data (เทียบหน่วยให้ตรงกัน)
        │
        ▼
Gemini: วิเคราะห์และให้คะแนน
        │
        ▼
Return: structured comparison + Thai summary
```

### Compare Summary Generator

```typescript
// lib/ai/compareSummary.ts
import { geminiJSON } from "@/lib/gemini"

export interface CompareResult {
  best_overall_id: string
  best_for_budget_id: string
  best_for_commute_id: string | null
  best_for_space_id: string
  summary: string                    // 2-3 ประโยคสรุปภาษาไทย
  listings_analysis: ListingAnalysis[]
}

interface ListingAnalysis {
  id: string
  fit_score: number                  // 0-100 คะแนนรวม
  pros: string[]                     // จุดเด่น (ภาษาไทย)
  cons: string[]                     // จุดด้อย (ภาษาไทย)
  best_for: string                   // เช่น "เหมาะกับคนที่ให้ความสำคัญกับการเดินทาง"
}

export async function generateCompareSummary(
  listings: any[],
  userIntent: ParsedIntent | null
): Promise<CompareResult> {

  const intentContext = userIntent
    ? `ความต้องการของผู้ใช้: ${userIntent.interpreted_as}\nงบประมาณ: ${userIntent.budget_max ? `ไม่เกิน ${userIntent.budget_max.toLocaleString()} บาท` : 'ไม่ระบุ'}`
    : 'ไม่มีข้อมูลความต้องการเฉพาะ'

  const normalizedListings = listings.map(l => ({
    id: l.id,
    title: l.title,
    price: l.price,
    bedrooms: l.bedrooms,
    bathrooms: l.bathrooms,
    usable_area: l.usable_area,
    district: l.district,
    nearest_bts: l.nearest_bts,
    nearest_bts_distance: l.nearest_bts_distance,
    furnishing: l.furnishing,
    parking_spaces: l.parking_spaces,
    amenities: l.amenities,
  }))

  const prompt = `
คุณคือผู้เชี่ยวชาญอสังหาริมทรัพย์ไทย ช่วยผู้ใช้เปรียบเทียบทรัพย์

${intentContext}

รายการที่เปรียบเทียบ:
${JSON.stringify(normalizedListings, null, 2)}

วิเคราะห์และ return JSON ตาม CompareResult schema:
- fit_score คำนึงถึงความตรงกับ intent ของผู้ใช้
- pros/cons ต้องเป็นภาษาไทยที่เข้าใจง่าย
- summary ต้องบอกชัดเจนว่าอันไหนเหมาะที่สุดและทำไม
- ถ้าไม่มี transit info ให้ best_for_commute_id เป็น null
`

  const result = await geminiJSON.generateContent(prompt)
  return JSON.parse(result.response.text()) as CompareResult
}
```

## 5.8 Rate Limiting & Caching Strategy

### Rate Limiting (Free Tier Management)

```typescript
// lib/ai/rateLimiter.ts
import { Redis } from 'ioredis'

const redis = new Redis(process.env.REDIS_URL!)

// Gemini Free: 1,500 req/day → 62 req/hour
const LIMITS = {
  per_user_per_hour: 20,         // ป้องกัน 1 user ใช้เยอะเกิน
  per_ip_per_minute: 5,          // ป้องกัน spam
  global_per_minute: 20,         // Buffer สำหรับ spike
}

export async function checkRateLimit(userId: string, ip: string): Promise<boolean> {
  const userKey = `ai_limit:user:${userId}:${Math.floor(Date.now() / 3600000)}`
  const ipKey = `ai_limit:ip:${ip}:${Math.floor(Date.now() / 60000)}`

  const [userCount, ipCount] = await Promise.all([
    redis.incr(userKey),
    redis.incr(ipKey),
  ])

  if (userCount === 1) await redis.expire(userKey, 3600)
  if (ipCount === 1) await redis.expire(ipKey, 60)

  return userCount <= LIMITS.per_user_per_hour &&
         ipCount <= LIMITS.per_ip_per_minute
}
```

### Caching Intent Results

```typescript
// Cache parsed intent ถ้า input เหมือนกัน (ภายใน 5 นาที)
export async function getCachedIntent(userMessage: string): Promise<ParsedIntent | null> {
  const key = `intent_cache:${hashMessage(userMessage)}`
  const cached = await redis.get(key)
  return cached ? JSON.parse(cached) : null
}

export async function setCachedIntent(userMessage: string, intent: ParsedIntent) {
  const key = `intent_cache:${hashMessage(userMessage)}`
  await redis.setex(key, 300, JSON.stringify(intent)) // 5 min TTL
}
```

---

# 6. Data Model

## 6.1 Complete ERD (Key Tables)

```
users
├── id (uuid, PK)
├── email (unique)
├── password_hash
├── role: user | agent | admin
├── status: pending_verification | active | suspended
├── created_at, updated_at

user_profiles
├── id, user_id (FK → users)
├── first_name, last_name
├── phone, avatar_url
├── preferred_search_history (jsonb)

agent_applications
├── id, user_id (FK)
├── full_name, company_name, phone
├── experience_years, expertise_areas[]
├── license_doc_url, id_doc_url
├── status: pending | approved | rejected | info_requested
├── admin_note, reviewed_by (FK → users), reviewed_at

agent_profiles
├── id, user_id (FK, unique)
├── display_name, bio, profile_image_url
├── verified_at, total_listings, rating

listings
├── id, agent_id (FK)
├── [all fields from 4.2]

listing_images
├── id, listing_id (FK)
├── url, order, is_cover

enquiries
├── id
├── listing_id (FK), agent_id (FK), user_id (FK, nullable)
├── name, phone, email, message
├── status: new | contacted | viewing_scheduled | negotiating | won | lost | spam
├── agent_notes (text, private)
├── created_at, updated_at

search_sessions
├── id, user_id (FK, nullable), session_token
├── created_at, last_active_at

search_messages
├── id, session_id (FK)
├── role: user | assistant
├── content (text)
├── created_at

parsed_search_intents
├── id, session_id (FK)
├── intent_data (jsonb) ← เก็บ ParsedIntent object
├── clarification_count (int)
├── created_at

compare_sets
├── id, user_id (FK, nullable), session_token
├── created_at, expires_at

compare_set_items
├── id, compare_set_id (FK), listing_id (FK)
├── added_at

admin_actions
├── id, admin_id (FK)
├── action_type (string)
├── target_type (user | agent | listing | application)
├── target_id
├── note, created_at

favorites
├── id, user_id (FK), listing_id (FK)
├── created_at
```

---

# 7. API Design

## 7.1 API Route Structure

```
/api/auth
  POST /register
  POST /login
  POST /logout
  POST /refresh
  GET  /me
  POST /forgot-password
  POST /reset-password

/api/listings
  GET  /                    ← search (filters via query params)
  POST /                    ← create (agent only)
  GET  /:id                 ← detail
  PUT  /:id                 ← update (agent, own only)
  DELETE /:id               ← delete draft (agent, own only)
  POST /:id/submit          ← submit for review
  POST /:id/unavailable     ← mark unavailable

/api/search
  POST /ai                  ← AI intent search (returns results or clarification)
  POST /ai/clarify          ← answer clarification question
  GET  /suggestions         ← autocomplete

/api/compare
  GET  /                    ← get current compare set
  POST /add                 ← add listing to compare
  DELETE /:listingId        ← remove from compare
  GET  /summary             ← AI compare summary

/api/enquiries
  POST /                    ← create enquiry (user)
  GET  /                    ← list own enquiries (user/agent)
  GET  /:id                 ← detail
  PUT  /:id/status          ← update status (agent)

/api/agent
  POST /apply               ← apply to be agent
  GET  /application         ← check application status
  GET  /listings            ← own listings
  GET  /leads               ← own leads

/api/admin
  GET  /users               ← list users
  PUT  /users/:id/suspend
  GET  /agents/applications ← application queue
  POST /agents/:id/approve
  POST /agents/:id/reject
  GET  /listings/queue      ← listing moderation queue
  POST /listings/:id/approve
  POST /listings/:id/reject
  GET  /analytics           ← dashboard stats
```

## 7.2 AI Search API — Request/Response Detail

### Request

```typescript
// POST /api/search/ai
{
  message: string,              // "อยากได้คอนโดใกล้ BTS ไม่เกิน 3 ล้าน"
  session_id?: string,          // ถ้ามี session เดิม
  clarification_answer?: string // ถ้าเป็นการตอบ clarification
}
```

### Response (Results)

```typescript
{
  type: "results",
  session_id: string,
  intent: ParsedIntent,
  explanation: string,          // "พบ 8 คอนโดใกล้ BTS ราคาไม่เกิน 3 ล้าน"
  listings: [{
    ...ListingData,
    match_reason: string        // "ราคาอยู่ในงบ ห่าง BTS 200 ม."
  }],
  total_count: number,
  page: number
}
```

### Response (Clarification)

```typescript
{
  type: "clarification",
  session_id: string,
  question: string,             // "กำลังมองจะซื้อหรือเช่าครับ?"
  quick_replies: string[],      // ["ซื้อ", "เช่า"]
  partial_intent: ParsedIntent, // ข้อมูลที่ parse ได้แล้ว
  field_asking_about: string    // "search_goal"
}
```

---

# 8. Frontend Architecture

## 8.1 Page Structure

```
pages/
├── / (Homepage)
│     ├── AI Search Box (ตรงกลาง)
│     ├── Quick Filter Tabs (ซื้อ/เช่า)
│     └── Featured Listings Grid

├── /search (Search Results)
│     ├── Filter Sidebar (left)
│     ├── AI Search Bar (top)
│     ├── Results Grid/List/Map toggle
│     └── Compare Tray (bottom, fixed)

├── /listing/[id] (Listing Detail)
│     ├── Image Gallery
│     ├── Info Panel
│     ├── Map
│     ├── Agent Card
│     ├── Enquiry Form
│     └── Similar Listings

├── /compare (Compare Page)
│     ├── Comparison Table
│     └── AI Summary Panel

├── /agent
│     ├── /listings (My Listings)
│     ├── /listings/new (Create Listing)
│     ├── /listings/[id]/edit
│     ├── /leads (Lead Inbox)
│     └── /analytics

└── /admin
      ├── /dashboard
      ├── /agents (Application Queue)
      ├── /listings (Moderation Queue)
      └── /users
```

## 8.2 State Management

```typescript
// stores/searchStore.ts (Zustand)
interface SearchStore {
  // AI Search State
  sessionId: string | null
  messages: SearchMessage[]
  currentIntent: ParsedIntent | null
  clarificationState: 'idle' | 'waiting_answer' | 'searching'
  
  // Results
  listings: Listing[]
  totalCount: number
  isLoading: boolean
  
  // Compare
  compareListings: string[]    // IDs
  
  // Actions
  sendMessage: (message: string) => Promise<void>
  answerClarification: (answer: string) => Promise<void>
  addToCompare: (id: string) => void
  removeFromCompare: (id: string) => void
  clearCompare: () => void
}
```

## 8.3 AI Search Chat Component

```typescript
// components/AISearch/AISearchBox.tsx
export function AISearchBox() {
  const { sendMessage, messages, clarificationState, isLoading } = useSearchStore()
  const [input, setInput] = useState('')

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return
    await sendMessage(input)
    setInput('')
  }

  const lastMessage = messages[messages.length - 1]
  const showClarification = lastMessage?.type === 'clarification'

  return (
    <div className="ai-search-container">
      {/* ช่องพิมพ์ */}
      <div className="search-input-row">
        <textarea
          placeholder="อธิบายสิ่งที่คุณต้องการ เช่น 'อยากได้คอนโดใกล้ BTS ไม่เกิน 3 ล้าน 1 ห้องนอน'"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSubmit()}
        />
        <button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? <Spinner /> : <SearchIcon />}
        </button>
      </div>

      {/* Clarification Question */}
      {showClarification && (
        <div className="clarification-card">
          <p>{lastMessage.question}</p>
          <div className="quick-replies">
            {lastMessage.quick_replies.map(reply => (
              <button key={reply} onClick={() => sendMessage(reply)}>
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* AI Interpretation Badge */}
      {lastMessage?.type === 'results' && lastMessage.explanation && (
        <div className="interpretation-badge">
          🤖 {lastMessage.explanation}
        </div>
      )}
    </div>
  )
}
```

---

# 9. Security & Permission Matrix

## 9.1 API Endpoint Permission Matrix

| Endpoint | Guest | User | Agent | Admin |
|---|---|---|---|---|
| GET /api/listings | ✅ | ✅ | ✅ | ✅ |
| POST /api/listings | ❌ | ❌ | ✅ | ❌ |
| PUT /api/listings/:id | ❌ | ❌ | ✅ (own) | ✅ |
| POST /api/search/ai | ✅ (limited) | ✅ | ✅ | ✅ |
| POST /api/enquiries | ✅ | ✅ | ❌ | ❌ |
| GET /api/agent/leads | ❌ | ❌ | ✅ (own) | ✅ |
| POST /api/admin/* | ❌ | ❌ | ❌ | ✅ |

## 9.2 Business Rule Enforcement

```typescript
// ตัวอย่าง: ป้องกัน User ลงประกาศ
export async function POST(req: Request) {
  const session = await getSession(req)
  
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  if (session.user.role !== 'agent') {
    return Response.json(
      { error: 'Only verified agents can create listings' },
      { status: 403 }
    )
  }
  
  // ตรวจว่า agent ยัง active อยู่ (ไม่ถูก suspend)
  const agent = await prisma.agentProfile.findUnique({
    where: { user_id: session.user.id }
  })
  
  if (!agent || agent.status !== 'active') {
    return Response.json({ error: 'Agent account is not active' }, { status: 403 })
  }
  
  // proceed...
}
```

---

# 10. Error Handling & Edge Cases

## 10.1 AI Error Handling

```typescript
// ถ้า Gemini fail → fallback to traditional search
export async function handleAISearch(message: string) {
  try {
    const intent = await parsePropertyIntent(message)
    return { success: true, intent }
  } catch (error) {
    console.error('AI parsing failed, falling back to keyword search')
    
    // Fallback: ใช้ message เป็น keyword search แทน
    return {
      success: false,
      fallback: true,
      keyword: message,
      message: 'ระบบ AI ขัดข้องชั่วคราว กำลังค้นหาด้วยคีย์เวิร์ดแทน'
    }
  }
}
```

## 10.2 Edge Cases ที่ต้องระวัง

| Edge Case | Handling |
|---|---|
| User พิมพ์ภาษาอังกฤษ | Gemini รองรับ, intent parser prompt ระบุให้ handle |
| งบประมาณเป็น "budget" ไม่ชัด เช่น "ราคาไม่แพง" | ถามกลับ |
| ทำเลที่ไม่มีในระบบ | แนะนำ area ใกล้เคียง |
| Listings ไม่ตรง intent เลย | แสดง "ไม่พบผลลัพธ์" + แนะนำขยาย criteria |
| Compare ทรัพย์ต่าง type กัน (บ้าน vs คอนโด) | แสดงได้แต่ AI note ว่าต่าง type |
| Gemini rate limit | fallback + queue retry |
| User ตอบ clarification ด้วยข้อมูลไม่ชัด | parse ใหม่ + ถามซ้ำ (สูงสุด 2 รอบ) |

---

*เอกสารนี้จัดทำเพื่อใช้เป็น Development Reference สำหรับทีมพัฒนา อัปเดตล่าสุด: 2025*
