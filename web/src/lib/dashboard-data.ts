import type { StatusKind } from "@/components/dashboard/status-chip";

export interface AgentListing {
  id: string;
  title: string;
  price: number;
  priceUnit: "total" | "per_month";
  status: Extract<
    StatusKind,
    | "draft"
    | "pending_review"
    | "published"
    | "rejected"
    | "revision_requested"
    | "unavailable"
    | "sold"
    | "rented"
  >;
  listingType: "sale" | "rent";
  imageUrl: string;
  views: number;
  enquiries: number;
  submittedAt: string;
  publishedAt?: string;
  district: string;
}

export const agentListings: AgentListing[] = [
  {
    id: "a1",
    title: "Ashton Asoke ห้องสตูดิโอ วิวเมือง ชั้นสูง",
    price: 6_900_000,
    priceUnit: "total",
    status: "published",
    listingType: "sale",
    imageUrl:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    views: 1284,
    enquiries: 24,
    submittedAt: "2026-04-02",
    publishedAt: "2026-04-03",
    district: "วัฒนา, กรุงเทพฯ",
  },
  {
    id: "a2",
    title: "บ้านเดี่ยว 3 ชั้น โครงการ The Grand พระราม 2",
    price: 18_500_000,
    priceUnit: "total",
    status: "pending_review",
    listingType: "sale",
    imageUrl:
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80",
    views: 0,
    enquiries: 0,
    submittedAt: "2026-04-15",
    district: "บางขุนเทียน, กรุงเทพฯ",
  },
  {
    id: "a3",
    title: "คอนโด Noble Ploenchit ชั้น 18",
    price: 8_250_000,
    priceUnit: "total",
    status: "revision_requested",
    listingType: "sale",
    imageUrl:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
    views: 0,
    enquiries: 0,
    submittedAt: "2026-04-10",
    district: "ปทุมวัน, กรุงเทพฯ",
  },
  {
    id: "a4",
    title: "ทาวน์โฮม 2 ชั้น พฤกษาวิลล์ รามอินทรา",
    price: 35_000,
    priceUnit: "per_month",
    status: "rented",
    listingType: "rent",
    imageUrl:
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80",
    views: 882,
    enquiries: 18,
    submittedAt: "2026-03-01",
    publishedAt: "2026-03-02",
    district: "คันนายาว, กรุงเทพฯ",
  },
  {
    id: "a5",
    title: "คอนโด Life Asoke-Rama 9 ห้องมุม",
    price: 5_850_000,
    priceUnit: "total",
    status: "draft",
    listingType: "sale",
    imageUrl:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
    views: 0,
    enquiries: 0,
    submittedAt: "2026-04-17",
    district: "ห้วยขวาง, กรุงเทพฯ",
  },
];

export interface Lead {
  id: string;
  userName: string;
  userPhone: string;
  userEmail: string;
  listingTitle: string;
  listingPrice: string;
  listingImage: string;
  message: string;
  status: Extract<StatusKind, "new" | "contacted" | "viewing_scheduled" | "negotiating" | "won" | "lost" | "spam">;
  createdAt: string;
  aiMatchScore?: number;
  notes?: string;
}

export const leads: Lead[] = [
  {
    id: "l1",
    userName: "ธนพล ภูวณิช",
    userPhone: "081-234-5678",
    userEmail: "thanapol@example.com",
    listingTitle: "Ashton Asoke ห้องสตูดิโอ",
    listingPrice: "฿6.90 ล้าน",
    listingImage:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80",
    message: "สนใจห้องนี้ ขอดูห้องจริงในวันเสาร์ช่วงบ่ายได้ไหมครับ?",
    status: "new",
    createdAt: "2026-04-18T10:30:00",
    aiMatchScore: 94,
  },
  {
    id: "l2",
    userName: "วิภาดา ศรีสวัสดิ์",
    userPhone: "089-987-6543",
    userEmail: "wipada@example.com",
    listingTitle: "บ้านเดี่ยว The Grand พระราม 2",
    listingPrice: "฿18.50 ล้าน",
    listingImage:
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=400&q=80",
    message: "อยากสอบถามเรื่องผ่อนและดาวน์ พอคุยรายละเอียดได้ไหมคะ",
    status: "contacted",
    createdAt: "2026-04-17T15:20:00",
    aiMatchScore: 86,
    notes: "โทรติดต่อครั้งแรก นัดคุยรายละเอียดจันทร์หน้า",
  },
  {
    id: "l3",
    userName: "ชลิตา แก้วจันทร์",
    userPhone: "092-111-2233",
    userEmail: "chalita@example.com",
    listingTitle: "คอนโด Life Asoke-Rama 9",
    listingPrice: "฿5.85 ล้าน",
    listingImage:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=400&q=80",
    message: "ขอดูห้องวันอาทิตย์นี้ได้ไหมคะ",
    status: "viewing_scheduled",
    createdAt: "2026-04-16T09:10:00",
    aiMatchScore: 78,
    notes: "นัดดูห้องวันอาทิตย์ 20 เม.ย. เวลา 14:00",
  },
  {
    id: "l4",
    userName: "ภาณุพงศ์ อินทรัตน์",
    userPhone: "081-555-4433",
    userEmail: "phanu@example.com",
    listingTitle: "คอนโด Noble Ploenchit",
    listingPrice: "฿8.25 ล้าน",
    listingImage:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=400&q=80",
    message: "ต่อรองราคาได้ประมาณเท่าไร?",
    status: "negotiating",
    createdAt: "2026-04-14T11:45:00",
    aiMatchScore: 82,
  },
  {
    id: "l5",
    userName: "กนกพร บุญประเสริฐ",
    userPhone: "062-777-8899",
    userEmail: "kanokporn@example.com",
    listingTitle: "ทาวน์โฮม พฤกษาวิลล์",
    listingPrice: "฿35,000/เดือน",
    listingImage:
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=400&q=80",
    message: "ตัดสินใจเช่าแล้วค่ะ ขอเซ็นสัญญาวันไหนดี",
    status: "won",
    createdAt: "2026-04-10T14:00:00",
    aiMatchScore: 91,
  },
];

export interface AgentApplication {
  id: string;
  fullName: string;
  company?: string;
  phone: string;
  email: string;
  avatar: string;
  experience: number;
  areas: string[];
  submittedAt: string;
  status: Extract<StatusKind, "pending_review" | "approved" | "rejected" | "info_requested">;
}

export const agentApplications: AgentApplication[] = [
  {
    id: "app1",
    fullName: "สุรศักดิ์ เจริญรุ่ง",
    company: "SR Property Group",
    phone: "081-234-5678",
    email: "surasak@example.com",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    experience: 5,
    areas: ["สุขุมวิท", "ทองหล่อ"],
    submittedAt: "2026-04-18T09:00:00",
    status: "pending_review",
  },
  {
    id: "app2",
    fullName: "พิมพ์ใจ สมบูรณ์",
    phone: "089-987-6543",
    email: "pimjai@example.com",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    experience: 3,
    areas: ["พระราม 9", "รัชดา"],
    submittedAt: "2026-04-17T14:20:00",
    status: "pending_review",
  },
  {
    id: "app3",
    fullName: "อนุชา ทองดี",
    company: "Anucha Realty",
    phone: "062-111-2233",
    email: "anucha@example.com",
    avatar: "https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?auto=format&fit=crop&w=200&q=80",
    experience: 8,
    areas: ["สาทร", "สีลม"],
    submittedAt: "2026-04-15T10:00:00",
    status: "info_requested",
  },
];

export interface ModerationListing {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  agent: string;
  agentAvatar: string;
  submittedAt: string;
  duplicateFlag?: boolean;
}

export const moderationQueue: ModerationListing[] = [
  {
    id: "m1",
    title: "คอนโด Ashton Chula-Silom วิวสวย ชั้นสูง",
    price: 9_200_000,
    imageUrl:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
    agent: "ณัฐพงศ์ อยู่สุข",
    agentAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    submittedAt: "2026-04-18T08:30:00",
  },
  {
    id: "m2",
    title: "บ้านเดี่ยว 2 ชั้น สวยพร้อมอยู่ ลาดพร้าว",
    price: 12_800_000,
    imageUrl:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    agent: "ศิริรัตน์ วงศ์ไพบูลย์",
    agentAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    submittedAt: "2026-04-17T16:20:00",
    duplicateFlag: true,
  },
  {
    id: "m3",
    title: "คอนโดให้เช่า The Room สาทร เฟอร์ครบ",
    price: 28_000,
    imageUrl:
      "https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&w=800&q=80",
    agent: "ปริญญา มาลัย",
    agentAvatar: "https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?auto=format&fit=crop&w=200&q=80",
    submittedAt: "2026-04-17T11:45:00",
  },
];

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "agent" | "admin";
  status: Extract<StatusKind, "active" | "suspended">;
  joined: string;
  lastActive: string;
  avatar: string;
  listings?: number;
  enquiries?: number;
}

export const adminUsers: AdminUser[] = [
  {
    id: "u1",
    name: "ธนพล ภูวณิช",
    email: "thanapol@example.com",
    role: "user",
    status: "active",
    joined: "2026-01-15",
    lastActive: "2026-04-18",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80",
    enquiries: 8,
  },
  {
    id: "u2",
    name: "ณัฐพงศ์ อยู่สุข",
    email: "nattapong@example.com",
    role: "agent",
    status: "active",
    joined: "2025-11-10",
    lastActive: "2026-04-18",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    listings: 24,
  },
  {
    id: "u3",
    name: "สมชาย ตัวแทน",
    email: "somchai@example.com",
    role: "agent",
    status: "suspended",
    joined: "2025-08-01",
    lastActive: "2026-03-22",
    avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80",
    listings: 5,
  },
  {
    id: "u4",
    name: "วิภาดา ศรีสวัสดิ์",
    email: "wipada@example.com",
    role: "user",
    status: "active",
    joined: "2026-02-20",
    lastActive: "2026-04-17",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
    enquiries: 3,
  },
];
