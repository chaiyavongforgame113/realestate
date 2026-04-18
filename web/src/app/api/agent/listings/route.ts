import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";
import { listingCreateSchema } from "@/lib/validation/listing";
import { toListingDTO } from "@/lib/listings/transform";
import { ok, handle } from "@/lib/api/respond";

/** GET /api/agent/listings — list own listings */
export async function GET(req: NextRequest) {
  try {
    const session = await requireRole(["agent", "admin"]);
    const status = req.nextUrl.searchParams.get("status") as
      | "draft"
      | "pending_review"
      | "published"
      | "rejected"
      | "revision_requested"
      | "unavailable"
      | "sold"
      | "rented"
      | null;

    const listings = await prisma.listing.findMany({
      where: { agentId: session.userId, ...(status && { status }) },
      orderBy: { updatedAt: "desc" },
      include: {
        images: { take: 1, orderBy: { order: "asc" } },
        agent: { include: { profile: true, agentProfile: true } },
      },
    });

    const withCounts = await Promise.all(
      listings.map(async (l) => {
        const [enquiries] = await Promise.all([
          prisma.enquiry.count({ where: { listingId: l.id } }),
        ]);
        return { ...toListingDTO(l), enquiries, views: 0 };
      })
    );

    return ok({ listings: withCounts });
  } catch (e) {
    return handle(e);
  }
}

/** POST /api/agent/listings — create a draft listing */
export async function POST(req: NextRequest) {
  try {
    const session = await requireRole(["agent", "admin"]);
    const body = await req.json();
    const data = listingCreateSchema.parse(body);

    const listing = await prisma.listing.create({
      data: {
        agentId: session.userId,
        status: "draft",
        listingType: data.listingType,
        propertyType: data.propertyType,
        title: data.title,
        description: data.description,
        price: data.price,
        priceUnit: data.priceUnit,
        usableArea: data.usableArea,
        landArea: data.landArea,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        parkingSpaces: data.parkingSpaces,
        floor: data.floor,
        totalFloors: data.totalFloors,
        furnishing: data.furnishing,
        projectName: data.projectName,
        district: data.district,
        province: data.province,
        latitude: data.latitude,
        longitude: data.longitude,
        addressDetail: data.addressDetail,
        nearestBts: data.nearestBts,
        nearestBtsDistance: data.nearestBtsDistance,
        nearestMrt: data.nearestMrt,
        nearestMrtDistance: data.nearestMrtDistance,
        nearestArl: data.nearestArl,
        nearestArlDistance: data.nearestArlDistance,
        coverImageUrl: data.coverImageUrl,
        videoUrl: data.videoUrl,
        virtualTourUrl: data.virtualTourUrl,
        amenities: JSON.stringify(data.amenities),
        lifestyleTags: JSON.stringify(data.lifestyleTags),
        images: {
          create: data.images.map((url, i) => ({
            url,
            order: i,
            isCover: url === data.coverImageUrl,
          })),
        },
      },
    });

    return ok({ id: listing.id });
  } catch (e) {
    return handle(e);
  }
}
