export type PropertyKind = "condo" | "house" | "townhouse" | "land" | "commercial";

export interface SampleListing {
  id: string;
  title: string;
  price: number;
  priceUnit: "total" | "per_month";
  listingType: "sale" | "rent";
  propertyType: PropertyKind;
  bedrooms: number;
  bathrooms: number;
  usableArea: number;
  district: string;
  nearestTransit?: string;
  transitDistance?: number;
  imageUrl: string;
  latitude?: number;
  longitude?: number;
  images?: { url: string; isCover: boolean }[];
  virtualTourUrl?: string | null;
  videoUrl?: string | null;
  aiRecommended?: boolean;
  matchReason?: string;
  agent: { name: string; avatar: string };
}

export const sampleListings: SampleListing[] = [
  {
    id: "1",
    title: "Ashton Asoke ห้องสตูดิโอ วิวเมือง ชั้นสูง",
    price: 6_900_000,
    priceUnit: "total",
    listingType: "sale",
    propertyType: "condo",
    bedrooms: 1,
    bathrooms: 1,
    usableArea: 34.5,
    district: "วัฒนา, กรุงเทพฯ",
    nearestTransit: "BTS อโศก",
    transitDistance: 180,
    imageUrl:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    aiRecommended: true,
    matchReason: "ใกล้ BTS เพียง 180 ม. · ราคาในงบประมาณ",
    agent: {
      name: "ณัฐพงศ์ อยู่สุข",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    },
  },
  {
    id: "2",
    title: "บ้านเดี่ยว 3 ชั้น โครงการ The Grand พระราม 2",
    price: 18_500_000,
    priceUnit: "total",
    listingType: "sale",
    propertyType: "house",
    bedrooms: 4,
    bathrooms: 4,
    usableArea: 320,
    district: "บางขุนเทียน, กรุงเทพฯ",
    imageUrl:
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
    agent: {
      name: "ศิริรัตน์ วงศ์ไพบูลย์",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    },
  },
  {
    id: "3",
    title: "คอนโดให้เช่า Noble Ploenchit ห้อง 1 นอน พร้อมอยู่",
    price: 45_000,
    priceUnit: "per_month",
    listingType: "rent",
    propertyType: "condo",
    bedrooms: 1,
    bathrooms: 1,
    usableArea: 46,
    district: "ปทุมวัน, กรุงเทพฯ",
    nearestTransit: "BTS เพลินจิต",
    transitDistance: 120,
    imageUrl:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
    aiRecommended: true,
    matchReason: "เดินถึง BTS · เฟอร์นิเจอร์ครบ",
    agent: {
      name: "ปริญญา มาลัย",
      avatar: "https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?auto=format&fit=crop&w=200&q=80",
    },
  },
  {
    id: "4",
    title: "ทาวน์โฮม 2 ชั้น พฤกษาวิลล์ รามอินทรา",
    price: 4_290_000,
    priceUnit: "total",
    listingType: "sale",
    propertyType: "townhouse",
    bedrooms: 3,
    bathrooms: 2,
    usableArea: 120,
    district: "คันนายาว, กรุงเทพฯ",
    imageUrl:
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
    agent: {
      name: "กัญญาภัค ศรีเจริญ",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80",
    },
  },
  {
    id: "5",
    title: "ที่ดินเปล่า 2 ไร่ ติดถนนหลัก บางนา-ตราด กม.23",
    price: 32_000_000,
    priceUnit: "total",
    listingType: "sale",
    propertyType: "land",
    bedrooms: 0,
    bathrooms: 0,
    usableArea: 3200,
    district: "บางพลี, สมุทรปราการ",
    imageUrl:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
    agent: {
      name: "อดิศักดิ์ พงษ์ทอง",
      avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80",
    },
  },
  {
    id: "6",
    title: "คอนโด Life Asoke-Rama 9 ตำแหน่ง Junction",
    price: 5_850_000,
    priceUnit: "total",
    listingType: "sale",
    propertyType: "condo",
    bedrooms: 1,
    bathrooms: 1,
    usableArea: 30,
    district: "ห้วยขวาง, กรุงเทพฯ",
    nearestTransit: "MRT พระราม 9",
    transitDistance: 280,
    imageUrl:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
    aiRecommended: true,
    matchReason: "ใกล้ทั้ง MRT และ Airport Link",
    agent: {
      name: "ธนวัฒน์ เจริญพร",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80",
    },
  },
  {
    id: "7",
    title: "บ้านเช่า 2 ชั้น ถนนสาธุประดิษฐ์ เฟอร์นิเจอร์ครบ",
    price: 38_000,
    priceUnit: "per_month",
    listingType: "rent",
    propertyType: "house",
    bedrooms: 3,
    bathrooms: 3,
    usableArea: 180,
    district: "ยานนาวา, กรุงเทพฯ",
    imageUrl:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    agent: {
      name: "จันทร์เพ็ญ ธรรมรักษ์",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
    },
  },
  {
    id: "8",
    title: "อาคารพาณิชย์ 4 ชั้น ทำเลทอง เยาวราช",
    price: 42_000_000,
    priceUnit: "total",
    listingType: "sale",
    propertyType: "commercial",
    bedrooms: 4,
    bathrooms: 4,
    usableArea: 240,
    district: "สัมพันธวงศ์, กรุงเทพฯ",
    imageUrl:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
    agent: {
      name: "วรพจน์ สุขสวัสดิ์",
      avatar: "https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&w=200&q=80",
    },
  },
];

export const propertyTypes = [
  { kind: "condo" as const, label: "คอนโดมิเนียม", count: 8432, icon: "Building2" },
  { kind: "house" as const, label: "บ้านเดี่ยว", count: 2104, icon: "Home" },
  { kind: "townhouse" as const, label: "ทาวน์เฮาส์", count: 1287, icon: "Warehouse" },
  { kind: "land" as const, label: "ที่ดิน", count: 642, icon: "Map" },
  { kind: "commercial" as const, label: "พาณิชย์", count: 318, icon: "Store" },
];

export const popularAreas = [
  {
    name: "สุขุมวิท",
    count: 1842,
    image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "สาทร",
    count: 1256,
    image: "https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "อารีย์ - พหลโยธิน",
    count: 983,
    image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "รัชดา - ห้วยขวาง",
    count: 1104,
    image: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "พระราม 9",
    count: 876,
    image: "https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "ลาดพร้าว",
    count: 762,
    image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80",
  },
];

export const quickSuggestions = [
  "คอนโดใกล้ BTS ไม่เกิน 3 ล้าน",
  "บ้านเดี่ยว 3 ห้องนอน แถวรามอินทรา",
  "คอนโดให้เช่า สุขุมวิท งบ 25,000",
  "ทาวน์โฮมใกล้รถไฟฟ้าสายสีม่วง",
  "ที่ดินเปล่า บางนา-ตราด",
  "คอนโดติด MRT พระราม 9 เฟอร์ครบ",
];
