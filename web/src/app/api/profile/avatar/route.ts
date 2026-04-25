import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { ok, err, handle } from "@/lib/api/respond";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 2 * 1024 * 1024;

/** POST /api/profile/avatar — upload user avatar */
export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();

    const form = await req.formData();
    const file = form.get("file");
    if (!file || !(file instanceof File)) return err("ไม่พบไฟล์", 400);
    if (!ALLOWED_TYPES.includes(file.type)) return err("รองรับเฉพาะ JPG, PNG, WebP", 400);
    if (file.size > MAX_SIZE) return err("ขนาดไฟล์เกิน 2 MB", 400);

    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const filename = `${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), Buffer.from(await file.arrayBuffer()));

    const url = `/uploads/avatars/${filename}`;
    await prisma.userProfile.upsert({
      where: { userId: session.userId },
      create: { userId: session.userId, avatarUrl: url },
      update: { avatarUrl: url },
    });

    return ok({ url });
  } catch (e) {
    return handle(e);
  }
}
