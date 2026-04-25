import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { uploadFile, isStorageConfigured } from "@/lib/storage/supabase";
import { ok, err, handle } from "@/lib/api/respond";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 2 * 1024 * 1024;

/** POST /api/profile/avatar — upload user avatar to Supabase Storage */
export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    if (!isStorageConfigured()) return err("Storage ยังไม่ได้ตั้งค่า — ติดต่อผู้ดูแลระบบ", 503);

    const form = await req.formData();
    const file = form.get("file");
    if (!file || !(file instanceof File)) return err("ไม่พบไฟล์", 400);
    if (!ALLOWED_TYPES.includes(file.type)) return err("รองรับเฉพาะ JPG, PNG, WebP", 400);
    if (file.size > MAX_SIZE) return err("ขนาดไฟล์เกิน 2 MB", 400);

    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `${session.userId}/${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;

    const result = await uploadFile({ bucket: "avatars", path, file, upsert: false });

    await prisma.userProfile.upsert({
      where: { userId: session.userId },
      create: { userId: session.userId, avatarUrl: result.url },
      update: { avatarUrl: result.url },
    });

    return ok({ url: result.url });
  } catch (e) {
    return handle(e);
  }
}
