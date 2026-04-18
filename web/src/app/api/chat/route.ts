import { NextResponse } from "next/server";
import { geminiText } from "@/lib/ai/client";

type ChatMsg = { role: "user" | "agent" | "system"; content: string };

const SYSTEM = `คุณคือผู้ช่วย AI ของ Estate AI — แพลตฟอร์มอสังหาริมทรัพย์ภาษาไทย
- ตอบเป็นภาษาไทยสุภาพ กระชับ ไม่เกิน 3-4 ประโยค
- แนะนำการค้นหา/ทรัพย์ แนะนำย่านน่าอยู่ ช่วยตัดสินใจ
- ถ้าผู้ใช้ถามเรื่องราคา ทำเล BTS ย่านยอดฮิต ตอบจากความรู้ทั่วไป
- ถ้าผู้ใช้อยากดูทรัพย์จริงๆ ให้ชวนไปที่หน้า /search
- ถ้ามีคำถามกฎหมาย/ภาษี ให้บอกว่าควรปรึกษาทนาย/agent มืออาชีพ
- ห้ามแต่งข้อมูลราคาหรือ listing ที่ไม่มีอยู่จริง`;

const FALLBACK_REPLIES = [
  "ขอบคุณที่ทักทายค่ะ 🌟 ลองพิมพ์ย่านที่สนใจในช่อง AI Search ด้านบน ระบบจะค้นหาให้ทันทีเลยนะคะ",
  "ตอนนี้ระบบแชทอัตโนมัติยังไม่ได้เชื่อม agent แต่คุณสามารถลองใช้ AI Search เพื่อดูประกาศได้ที่ /search ค่ะ",
  "ลองบอกเราเพิ่มเติมเช่น งบประมาณ ย่าน หรือจำนวนห้องนอนที่ต้องการ ระบบจะแนะนำได้ตรงใจยิ่งขึ้นค่ะ",
];

export async function POST(req: Request) {
  let body: { messages?: ChatMsg[] } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const messages = body.messages ?? [];
  if (!messages.length) return NextResponse.json({ error: "empty" }, { status: 400 });

  // Build plain text transcript for Gemini
  const transcript = messages
    .slice(-10)
    .map((m) => `${m.role === "user" ? "ผู้ใช้" : "ผู้ช่วย"}: ${m.content}`)
    .join("\n");
  const prompt = `${SYSTEM}\n\nบทสนทนา:\n${transcript}\n\nตอบในฐานะผู้ช่วย:`;

  const reply = await geminiText(prompt, { temperature: 0.6 });
  if (reply) return NextResponse.json({ reply });

  // Fallback — deterministic canned reply
  const pick = FALLBACK_REPLIES[Math.floor(Math.random() * FALLBACK_REPLIES.length)];
  return NextResponse.json({ reply: pick, fallback: true });
}
