import { PrismaClient, UserRole, UserStatus, ListingType, PropertyType, ListingStatus, Furnishing, PriceUnit } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear (in FK-safe order)
  await prisma.refreshToken.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.compareSetItem.deleteMany();
  await prisma.compareSet.deleteMany();
  await prisma.enquiry.deleteMany();
  await prisma.listingImage.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.agentApplication.deleteMany();
  await prisma.agentProfile.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.parsedSearchIntent.deleteMany();
  await prisma.searchMessage.deleteMany();
  await prisma.searchSession.deleteMany();
  await prisma.adminAction.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  // Admin
  const admin = await prisma.user.create({
    data: {
      email: "admin@estate.app",
      passwordHash,
      role: UserRole.admin,
      status: UserStatus.active,
      emailVerifiedAt: new Date(),
      profile: { create: { firstName: "Admin", lastName: "User" } },
    },
  });

  // Agents
  const agent1 = await prisma.user.create({
    data: {
      email: "agent@estate.app",
      passwordHash,
      role: UserRole.agent,
      status: UserStatus.active,
      emailVerifiedAt: new Date(),
      profile: { create: { firstName: "ณัฐพงศ์", lastName: "อยู่สุข", phone: "081-234-5678" } },
      agentProfile: {
        create: {
          displayName: "ณัฐพงศ์ อยู่สุข",
          bio: "Agent ประจำย่านสุขุมวิท 5 ปี",
          profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
          verifiedAt: new Date(),
          totalListings: 5,
          rating: 4.8,
        },
      },
    },
  });

  const agent2 = await prisma.user.create({
    data: {
      email: "agent2@estate.app",
      passwordHash,
      role: UserRole.agent,
      status: UserStatus.active,
      emailVerifiedAt: new Date(),
      profile: { create: { firstName: "ศิริรัตน์", lastName: "วงศ์ไพบูลย์", phone: "089-987-6543" } },
      agentProfile: {
        create: {
          displayName: "ศิริรัตน์ วงศ์ไพบูลย์",
          profileImageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
          verifiedAt: new Date(),
          totalListings: 3,
          rating: 4.6,
        },
      },
    },
  });

  // User
  await prisma.user.create({
    data: {
      email: "user@estate.app",
      passwordHash,
      role: UserRole.user,
      status: UserStatus.active,
      emailVerifiedAt: new Date(),
      profile: { create: { firstName: "ธนพล", lastName: "ภูวณิช", phone: "081-234-5678" } },
    },
  });

  // Pending agent application
  await prisma.agentApplication.create({
    data: {
      userId: (await prisma.user.create({
        data: {
          email: "applicant@estate.app",
          passwordHash,
          role: UserRole.user,
          status: UserStatus.active,
          profile: { create: { firstName: "สุรศักดิ์", lastName: "เจริญรุ่ง" } },
        },
      })).id,
      fullName: "สุรศักดิ์ เจริญรุ่ง",
      companyName: "SR Property Group",
      phone: "081-234-5678",
      experienceYears: 5,
      expertiseAreas: JSON.stringify(["สุขุมวิท", "ทองหล่อ"]),
    },
  });

  // Listings
  const listings = [
    {
      agentId: agent1.id,
      status: ListingStatus.published,
      listingType: ListingType.sale,
      propertyType: PropertyType.condo,
      title: "Ashton Asoke ห้องสตูดิโอ วิวเมือง ชั้นสูง",
      description: "ทรัพย์คุณภาพใจกลาง CBD ใกล้ BTS อโศก เดินเพียง 3 นาที เหมาะทั้งอยู่อาศัยและลงทุนปล่อยเช่า ห้องตกแต่งครบพร้อมอยู่",
      price: 6_900_000,
      priceUnit: PriceUnit.total,
      usableArea: 34.5,
      bedrooms: 1,
      bathrooms: 1,
      parkingSpaces: 1,
      floor: 32,
      totalFloors: 50,
      furnishing: Furnishing.fully_furnished,
      projectName: "Ashton Asoke",
      district: "วัฒนา",
      province: "กรุงเทพฯ",
      latitude: 13.7374,
      longitude: 100.5603,
      nearestBts: "อโศก",
      nearestBtsDistance: 180,
      nearestMrt: "สุขุมวิท",
      nearestMrtDistance: 320,
      coverImageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      amenities: JSON.stringify(["สระว่ายน้ำ", "ฟิตเนส", "รักษาความปลอดภัย 24 ชม.", "ลิฟต์"]),
      lifestyleTags: JSON.stringify(["near_bts", "cbd", "investment"]),
      publishedAt: new Date(),
    },
    {
      agentId: agent2.id,
      status: ListingStatus.published,
      listingType: ListingType.sale,
      propertyType: PropertyType.house,
      title: "บ้านเดี่ยว 3 ชั้น โครงการ The Grand พระราม 2",
      description: "บ้านเดี่ยวหรูในโครงการคุณภาพ สิ่งอำนวยความสะดวกครบ",
      price: 18_500_000,
      priceUnit: PriceUnit.total,
      usableArea: 320,
      bedrooms: 4,
      bathrooms: 4,
      parkingSpaces: 2,
      furnishing: Furnishing.partially_furnished,
      projectName: "The Grand พระราม 2",
      district: "บางขุนเทียน",
      province: "กรุงเทพฯ",
      latitude: 13.6555,
      longitude: 100.4384,
      coverImageUrl: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
      amenities: JSON.stringify(["สระว่ายน้ำ", "สวน", "รักษาความปลอดภัย 24 ชม.", "ที่จอดรถ"]),
      lifestyleTags: JSON.stringify(["family", "quiet_neighborhood"]),
      publishedAt: new Date(),
    },
    {
      agentId: agent1.id,
      status: ListingStatus.published,
      listingType: ListingType.rent,
      propertyType: PropertyType.condo,
      title: "คอนโดให้เช่า Noble Ploenchit ห้อง 1 นอน พร้อมอยู่",
      description: "ห้องพร้อมอยู่ เฟอร์นิเจอร์ครบ ใกล้ BTS เพลินจิต",
      price: 45_000,
      priceUnit: PriceUnit.per_month,
      usableArea: 46,
      bedrooms: 1,
      bathrooms: 1,
      parkingSpaces: 1,
      floor: 18,
      totalFloors: 32,
      furnishing: Furnishing.fully_furnished,
      projectName: "Noble Ploenchit",
      district: "ปทุมวัน",
      province: "กรุงเทพฯ",
      latitude: 13.7437,
      longitude: 100.5477,
      nearestBts: "เพลินจิต",
      nearestBtsDistance: 120,
      coverImageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
      amenities: JSON.stringify(["สระว่ายน้ำ", "ฟิตเนส", "Co-working space", "รักษาความปลอดภัย 24 ชม."]),
      lifestyleTags: JSON.stringify(["near_bts", "ready_to_move", "fully_furnished"]),
      publishedAt: new Date(),
    },
    {
      agentId: agent2.id,
      status: ListingStatus.published,
      listingType: ListingType.sale,
      propertyType: PropertyType.townhouse,
      title: "ทาวน์โฮม 2 ชั้น พฤกษาวิลล์ รามอินทรา",
      description: "ทาวน์โฮมคุณภาพ ย่านสงบ เหมาะกับครอบครัว",
      price: 4_290_000,
      priceUnit: PriceUnit.total,
      usableArea: 120,
      bedrooms: 3,
      bathrooms: 2,
      parkingSpaces: 2,
      furnishing: Furnishing.unfurnished,
      projectName: "พฤกษาวิลล์ รามอินทรา",
      district: "คันนายาว",
      province: "กรุงเทพฯ",
      latitude: 13.8158,
      longitude: 100.6823,
      coverImageUrl: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
      amenities: JSON.stringify(["สวน", "ที่จอดรถ", "รักษาความปลอดภัย 24 ชม."]),
      lifestyleTags: JSON.stringify(["family", "suburb"]),
      publishedAt: new Date(),
    },
    {
      agentId: agent1.id,
      status: ListingStatus.published,
      listingType: ListingType.sale,
      propertyType: PropertyType.land,
      title: "ที่ดินเปล่า 2 ไร่ ติดถนนหลัก บางนา-ตราด กม.23",
      description: "ที่ดินทำเลทอง เหมาะสำหรับลงทุนหรือพัฒนาโครงการ",
      price: 32_000_000,
      priceUnit: PriceUnit.total,
      usableArea: 3200,
      landArea: 2,
      bedrooms: 0,
      bathrooms: 0,
      parkingSpaces: 0,
      furnishing: Furnishing.unfurnished,
      district: "บางพลี",
      province: "สมุทรปราการ",
      latitude: 13.6173,
      longitude: 100.7763,
      coverImageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
      amenities: JSON.stringify([]),
      lifestyleTags: JSON.stringify(["investment", "roadside"]),
      publishedAt: new Date(),
    },
    {
      agentId: agent2.id,
      status: ListingStatus.published,
      listingType: ListingType.sale,
      propertyType: PropertyType.condo,
      title: "คอนโด Life Asoke-Rama 9 ตำแหน่ง Junction",
      description: "คอนโดใกล้ทั้ง MRT และ Airport Link ทำเลเชื่อมต่อหลายเส้นทาง",
      price: 5_850_000,
      priceUnit: PriceUnit.total,
      usableArea: 30,
      bedrooms: 1,
      bathrooms: 1,
      parkingSpaces: 1,
      floor: 22,
      totalFloors: 38,
      furnishing: Furnishing.partially_furnished,
      projectName: "Life Asoke-Rama 9",
      district: "ห้วยขวาง",
      province: "กรุงเทพฯ",
      latitude: 13.7570,
      longitude: 100.5693,
      nearestMrt: "พระราม 9",
      nearestMrtDistance: 280,
      nearestArl: "มักกะสัน",
      nearestArlDistance: 420,
      coverImageUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
      amenities: JSON.stringify(["สระว่ายน้ำ", "ฟิตเนส", "Co-working space"]),
      lifestyleTags: JSON.stringify(["near_mrt", "near_airport_link", "investment"]),
      publishedAt: new Date(),
    },
    {
      agentId: agent1.id,
      status: ListingStatus.pending_review,
      listingType: ListingType.sale,
      propertyType: PropertyType.condo,
      title: "คอนโด Noble Ploenchit ชั้น 18",
      description: "ห้อง 1 นอน ขนาด 46 ตร.ม. วิวสวน",
      price: 8_250_000,
      priceUnit: PriceUnit.total,
      usableArea: 46,
      bedrooms: 1,
      bathrooms: 1,
      parkingSpaces: 1,
      floor: 18,
      furnishing: Furnishing.fully_furnished,
      projectName: "Noble Ploenchit",
      district: "ปทุมวัน",
      province: "กรุงเทพฯ",
      latitude: 13.7437,
      longitude: 100.5477,
      nearestBts: "เพลินจิต",
      nearestBtsDistance: 120,
      coverImageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
      amenities: JSON.stringify(["สระว่ายน้ำ", "ฟิตเนส"]),
      lifestyleTags: JSON.stringify(["near_bts"]),
    },
  ];

  for (const l of listings) {
    await prisma.listing.create({ data: l });
  }

  console.log("✓ Seeded");
  console.log(`   admin@estate.app / password123`);
  console.log(`   agent@estate.app / password123`);
  console.log(`   user@estate.app / password123`);
  console.log(`   ${listings.length} listings`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
