import { z } from "zod";

const listingTypeEnum = z.enum(["sale", "rent"]);
const propertyTypeEnum = z.enum(["condo", "house", "townhouse", "land", "commercial"]);
const furnishingEnum = z.enum(["fully_furnished", "partially_furnished", "unfurnished"]);
const priceUnitEnum = z.enum(["total", "per_month", "per_sqm"]);

export const listingCreateSchema = z.object({
  listingType: listingTypeEnum,
  propertyType: propertyTypeEnum,
  title: z.string().min(5, "ชื่อประกาศสั้นเกินไป").max(200),
  description: z.string().min(10, "กรุณาอธิบายเพิ่มเติม").max(5000),
  price: z.number().positive("ราคาต้องมากกว่า 0"),
  priceUnit: priceUnitEnum.default("total"),
  usableArea: z.number().positive(),
  landArea: z.number().positive().optional(),
  bedrooms: z.number().int().min(0).max(20),
  bathrooms: z.number().int().min(0).max(20),
  parkingSpaces: z.number().int().min(0).max(20).default(0),
  floor: z.number().int().min(0).optional(),
  totalFloors: z.number().int().min(0).optional(),
  furnishing: furnishingEnum.default("unfurnished"),
  projectName: z.string().optional(),
  district: z.string().min(1),
  province: z.string().min(1),
  latitude: z.number(),
  longitude: z.number(),
  addressDetail: z.string().optional(),
  nearestBts: z.string().optional(),
  nearestBtsDistance: z.number().int().positive().optional(),
  nearestMrt: z.string().optional(),
  nearestMrtDistance: z.number().int().positive().optional(),
  nearestArl: z.string().optional(),
  nearestArlDistance: z.number().int().positive().optional(),
  coverImageUrl: z.string().url().or(z.string().startsWith("/")),
  images: z.array(z.string().url().or(z.string().startsWith("/"))).default([]),
  virtualTourUrl: z.string().url().or(z.literal("")).optional().transform((v) => v || undefined),
  videoUrl: z.string().url().or(z.literal("")).optional().transform((v) => v || undefined),
  amenities: z.array(z.string()).default([]),
  lifestyleTags: z.array(z.string()).default([]),
});

export const listingUpdateSchema = listingCreateSchema.partial();

export type ListingCreateInput = z.infer<typeof listingCreateSchema>;
export type ListingUpdateInput = z.infer<typeof listingUpdateSchema>;
