import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { getSession } from "@/lib/auth/session";
import { ok, err, handle } from "@/lib/api/respond";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

/**
 * POST /api/upload — multipart form upload.
 * Stores to public/uploads/listings/ and returns a public URL.
 * Swap this out for S3/Cloudinary in production — keep the same response shape.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return err("Unauthorized", 401);
    if (!["agent", "admin"].includes(session.role)) return err("Forbidden", 403);

    const form = await req.formData();
    const file = form.get("file");

    if (!file || !(file instanceof File)) return err("ไม่พบไฟล์", 400);
    if (!ALLOWED_TYPES.includes(file.type)) return err("รองรับเฉพาะ JPG, PNG, WebP", 400);
    if (file.size > MAX_SIZE) return err("ขนาดไฟล์เกิน 10 MB", 400);

    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const filename = `${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "listings");
    await mkdir(uploadDir, { recursive: true });
    const filepath = path.join(uploadDir, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filepath, buffer);

    return ok({ url: `/uploads/listings/${filename}`, size: file.size });
  } catch (e) {
    return handle(e);
  }
}
