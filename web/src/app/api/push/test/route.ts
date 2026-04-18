import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { sendPushToUser } from "@/lib/push/send";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  let payload: { title?: string; body?: string; url?: string } = {};
  try {
    payload = await req.json();
  } catch {
    /* use defaults */
  }

  const res = await sendPushToUser(user.id, {
    title: payload.title || "Estate AI — ทดสอบการแจ้งเตือน",
    body:
      payload.body ||
      "ถ้าคุณเห็นข้อความนี้แสดงว่าการแจ้งเตือนถูกต้อง! เราจะส่งทรัพย์ใหม่ที่ตรงใจให้คุณโดยอัตโนมัติ",
    url: payload.url || "/",
    tag: "test",
  });
  return NextResponse.json({ ok: true, ...res });
}
