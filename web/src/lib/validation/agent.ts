import { z } from "zod";

export const agentApplicationSchema = z.object({
  fullName: z.string().min(2, "กรุณากรอกชื่อ-นามสกุล"),
  companyName: z.string().optional(),
  phone: z.string().min(9, "เบอร์โทรไม่ถูกต้อง"),
  experienceYears: z.number().int().min(0).max(50),
  expertiseAreas: z.array(z.string()).default([]),
  licenseDocumentUrl: z.string().optional(),
  idDocumentUrl: z.string().optional(),
});

export const applicationReviewSchema = z.object({
  action: z.enum(["approve", "reject", "request_info"]),
  note: z.string().optional(),
});

export type AgentApplicationInput = z.infer<typeof agentApplicationSchema>;
