import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { requireSession } from "@/lib/auth/session";
import { uploadFile, isStorageConfigured } from "@/lib/storage/supabase";
import { ok, err, handle } from "@/lib/api/respond";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_KINDS = ["license", "id"] as const;

/** POST /api/agent/apply/upload — upload license/ID document to private bucket */
export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    if (!isStorageConfigured()) return err("Storage ยังไม่ได้ตั้งค่า — ติดต่อผู้ดูแลระบบ", 503);

    const form = await req.formData();
    const file = form.get("file");
    const kindRaw = form.get("kind");
    const kind = typeof kindRaw === "string" ? kindRaw : null;

    if (!file || !(file instanceof File)) return err("ไม่พบไฟล์", 400);
    if (!kind || !ALLOWED_KINDS.includes(kind as (typeof ALLOWED_KINDS)[number])) {
      return err("kind ไม่ถูกต้อง", 400);
    }
    if (!ALLOWED_TYPES.includes(file.type)) return err("รองรับเฉพาะ JPG, PNG, WebP, PDF", 400);
    if (file.size > MAX_SIZE) return err("ขนาดไฟล์เกิน 5 MB", 400);

    const ext =
      file.type === "application/pdf"
        ? "pdf"
        : file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
        ? "webp"
        : "jpg";
    const path = `${session.userId}/${kind}-${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;

    const result = await uploadFile({ bucket: "agent-docs", path, file });

    return ok({ path: result.path, name: file.name, size: file.size });
  } catch (e) {
    return handle(e);
  }
}
