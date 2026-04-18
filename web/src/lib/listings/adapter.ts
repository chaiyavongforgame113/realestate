import type { ListingDTO } from "./transform";
import type { SampleListing } from "../sample-data";

/**
 * Map a DTO from the API into the shape existing ListingCard expects.
 * Keeps components unchanged while we migrate from mock data to DB.
 */
export function toCardView(l: ListingDTO): SampleListing {
  const nearestTransit = l.nearestBts
    ? `BTS ${l.nearestBts}`
    : l.nearestMrt
    ? `MRT ${l.nearestMrt}`
    : l.nearestArl
    ? `ARL ${l.nearestArl}`
    : undefined;

  const transitDistance = l.nearestBtsDistance ?? l.nearestMrtDistance ?? l.nearestArlDistance;

  return {
    id: l.id,
    title: l.title,
    price: l.price,
    priceUnit: l.priceUnit as "total" | "per_month",
    listingType: l.listingType as "sale" | "rent",
    propertyType: l.propertyType as SampleListing["propertyType"],
    bedrooms: l.bedrooms,
    bathrooms: l.bathrooms,
    usableArea: l.usableArea,
    district: `${l.district}, ${l.province}`,
    nearestTransit,
    transitDistance: transitDistance ?? undefined,
    imageUrl: l.coverImageUrl,
    latitude: l.latitude,
    longitude: l.longitude,
    images: l.images?.map((img) => ({ url: img.url, isCover: img.isCover })),
    virtualTourUrl: l.virtualTourUrl,
    videoUrl: l.videoUrl,
    agent: {
      name: l.agent?.name ?? "—",
      avatar: l.agent?.avatar ?? "",
    },
  };
}
