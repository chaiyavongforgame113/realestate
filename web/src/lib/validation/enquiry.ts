import { z } from "zod";

export const enquiryCreateSchema = z.object({
  listingId: z.string().min(1),
  name: z.string().min(2, "กรุณากรอกชื่อ"),
  phone: z.string().min(9, "เบอร์โทรไม่ถูกต้อง"),
  email: z.string().email().optional().or(z.literal("")),
  message: z.string().min(5).max(2000),
});

export const enquiryStatusSchema = z.object({
  status: z.enum(["new", "contacted", "viewing_scheduled", "negotiating", "won", "lost", "spam"]),
});

export const enquiryNotesSchema = z.object({
  agentNotes: z.string().max(2000),
});

export type EnquiryCreateInput = z.infer<typeof enquiryCreateSchema>;
