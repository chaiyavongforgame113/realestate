import type { Listing, ListingImage, User, AgentProfile, UserProfile } from "@prisma/client";

type ListingWithRelations = Listing & {
  images?: ListingImage[];
  agent?: (User & { profile?: UserProfile | null; agentProfile?: AgentProfile | null }) | null;
};

/**
 * Serialize DB listing to the shape the frontend expects. Parses JSON array fields
 * (amenities, lifestyleTags) from string storage (SQLite) back into arrays.
 */
export function toListingDTO(l: ListingWithRelations) {
  return {
    id: l.id,
    status: l.status,
    listingType: l.listingType,
    propertyType: l.propertyType,
    title: l.title,
    description: l.description,
    price: l.price,
    priceUnit: l.priceUnit,
    usableArea: l.usableArea,
    landArea: l.landArea,
    bedrooms: l.bedrooms,
    bathrooms: l.bathrooms,
    parkingSpaces: l.parkingSpaces,
    floor: l.floor,
    totalFloors: l.totalFloors,
    furnishing: l.furnishing,
    projectName: l.projectName,
    district: l.district,
    province: l.province,
    latitude: l.latitude,
    longitude: l.longitude,
    nearestBts: l.nearestBts,
    nearestBtsDistance: l.nearestBtsDistance,
    nearestMrt: l.nearestMrt,
    nearestMrtDistance: l.nearestMrtDistance,
    nearestArl: l.nearestArl,
    nearestArlDistance: l.nearestArlDistance,
    coverImageUrl: l.coverImageUrl,
    videoUrl: l.videoUrl,
    virtualTourUrl: l.virtualTourUrl,
    adminNote: l.adminNote,
    rejectionReason: l.rejectionReason,
    amenities: parseArray(l.amenities),
    lifestyleTags: parseArray(l.lifestyleTags),
    images: l.images?.map((img) => ({ id: img.id, url: img.url, isCover: img.isCover, order: img.order })) ?? [],
    agent: l.agent
      ? {
          id: l.agent.id,
          name:
            l.agent.agentProfile?.displayName ??
            `${l.agent.profile?.firstName ?? ""} ${l.agent.profile?.lastName ?? ""}`.trim(),
          avatar: l.agent.agentProfile?.profileImageUrl ?? l.agent.profile?.avatarUrl ?? null,
          verified: !!l.agent.agentProfile?.verifiedAt,
          rating: l.agent.agentProfile?.rating ?? null,
        }
      : null,
    createdAt: l.createdAt,
    publishedAt: l.publishedAt,
  };
}

function parseArray(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export type ListingDTO = ReturnType<typeof toListingDTO>;
