import type { ListingDTO } from "./transform";

export interface ListingsResponse {
  listings: ListingDTO[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface SearchParams {
  listing_type?: "sale" | "rent";
  property_types?: string[];
  districts?: string[];
  price_min?: number;
  price_max?: number;
  bedrooms_min?: number;
  bathrooms_min?: number;
  usable_area_min?: number;
  sort_by?: "newest" | "price_asc" | "price_desc" | "relevance";
  page?: number;
  limit?: number;
}

export async function fetchListings(params: SearchParams = {}): Promise<ListingsResponse> {
  const qs = new URLSearchParams();
  if (params.listing_type) qs.set("listing_type", params.listing_type);
  if (params.property_types?.length) qs.set("property_types", params.property_types.join(","));
  if (params.districts?.length) qs.set("districts", params.districts.join(","));
  if (params.price_min !== undefined) qs.set("price_min", String(params.price_min));
  if (params.price_max !== undefined) qs.set("price_max", String(params.price_max));
  if (params.bedrooms_min !== undefined) qs.set("bedrooms_min", String(params.bedrooms_min));
  if (params.bathrooms_min !== undefined) qs.set("bathrooms_min", String(params.bathrooms_min));
  if (params.sort_by) qs.set("sort_by", params.sort_by);
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));

  const res = await fetch(`/api/listings?${qs.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load listings");
  return res.json();
}

export async function fetchListing(id: string) {
  const res = await fetch(`/api/listings/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Listing not found");
  return res.json() as Promise<{ listing: ListingDTO }>;
}

export type { ListingDTO };
