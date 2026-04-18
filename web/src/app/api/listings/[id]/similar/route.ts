import { prisma } from "@/lib/prisma";
import { toListingDTO } from "@/lib/listings/transform";
import { ok, err, handle } from "@/lib/api/respond";

/** GET /api/listings/[id]/similar — similar published listings */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const anchor = await prisma.listing.findUnique({ where: { id } });
    if (!anchor) return err("Not found", 404);

    // Find listings of same property type + same listing type, prefer same district, excluding self
    const priceBand = anchor.price * 0.35;

    const items = await prisma.listing.findMany({
      where: {
        id: { not: id },
        status: "published",
        propertyType: anchor.propertyType,
        listingType: anchor.listingType,
        price: {
          gte: anchor.price - priceBand,
          lte: anchor.price + priceBand,
        },
      },
      orderBy: [
        { district: anchor.district === "" ? undefined : undefined }, // placeholder
        { publishedAt: "desc" },
      ],
      take: 8,
      include: {
        images: { take: 1, orderBy: { order: "asc" } },
        agent: { include: { profile: true, agentProfile: true } },
      },
    });

    // Sort: same district first
    const sorted = items.sort((a, b) => {
      const aSame = a.district === anchor.district ? 1 : 0;
      const bSame = b.district === anchor.district ? 1 : 0;
      return bSame - aSame;
    });

    return ok({ listings: sorted.slice(0, 4).map(toListingDTO) });
  } catch (e) {
    return handle(e);
  }
}
