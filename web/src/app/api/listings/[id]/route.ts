import { prisma } from "@/lib/prisma";
import { toListingDTO } from "@/lib/listings/transform";
import { ok, err, handle } from "@/lib/api/respond";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        images: { orderBy: { order: "asc" } },
        agent: { include: { profile: true, agentProfile: true } },
      },
    });

    if (!listing || listing.status !== "published") return err("Not found", 404);

    return ok({ listing: toListingDTO(listing) });
  } catch (e) {
    return handle(e);
  }
}
