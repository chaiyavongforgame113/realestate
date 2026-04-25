import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { ok, handle } from "@/lib/api/respond";

const PatchSchema = z.object({
  firstName: z.string().trim().min(1).max(50).optional(),
  lastName: z.string().trim().min(1).max(50).optional(),
  phone: z
    .string()
    .trim()
    .min(8)
    .max(20)
    .regex(/^[0-9+\-\s()]+$/, "เบอร์โทรไม่ถูกต้อง")
    .optional()
    .or(z.literal("")),
});

/** PATCH /api/profile — update first/last name and phone */
export async function PATCH(req: Request) {
  try {
    const session = await requireSession();
    const body = await req.json();
    const data = PatchSchema.parse(body);

    await prisma.userProfile.upsert({
      where: { userId: session.userId },
      create: {
        userId: session.userId,
        firstName: data.firstName ?? null,
        lastName: data.lastName ?? null,
        phone: data.phone || null,
      },
      update: {
        ...(data.firstName !== undefined && { firstName: data.firstName }),
        ...(data.lastName !== undefined && { lastName: data.lastName }),
        ...(data.phone !== undefined && { phone: data.phone || null }),
      },
    });

    return ok({ ok: true });
  } catch (e) {
    return handle(e);
  }
}
