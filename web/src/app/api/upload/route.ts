import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { getSession } from "@/lib/auth/session";
import { uploadFile, isStorageConfigured } from "@/lib/storage/supabase";
import { ok, err, handle } from "@/lib/api/respond";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024;

/**
 * POST /api/upload — listing image upload (agent/admin only).
 * Stores in Supabase "listings" bucket and returns a public CDN URL.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return err("Unauthorized", 401);
    if (!["agent", "admin"].includes(session.role)) return err("Forbidden", 403);
    if (!isStorageConfigured()) return err("Storage ยังไม่ได้ตั้งค่า — ติดต่อผู้ดูแลระบบ", 503);

    const form = await req.formData();
    const file = form.get("file");

    if (!file || !(file instanceof File)) return err("ไม่พบไฟล์", 400);
    if (!ALLOWED_TYPES.includes(file.type)) return err("รองรับเฉพาะ JPG, PNG, WebP", 400);
    if (file.size > MAX_SIZE) return err("ขนาดไฟล์เกิน 10 MB", 400);

    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `${session.userId}/${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;

    const result = await uploadFile({ bucket: "listings", path, file });

    return ok({ url: result.url, size: file.size });
  } catch (e) {
    return handle(e);
  }
}
