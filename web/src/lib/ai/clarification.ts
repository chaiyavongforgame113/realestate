import { geminiText } from "./client";
import type { ClarificationResult, MissingField, ParsedIntent } from "./types";

const FIELD_PRIORITY: MissingField[] = ["search_goal", "budget", "location"];

const QUICK_REPLIES: Record<MissingField, string[]> = {
  search_goal: ["🏠 ซื้อ", "🔑 เช่า"],
  budget: ["ต่ำกว่า 2 ล้าน", "2-5 ล้าน", "5-10 ล้าน", "10 ล้านขึ้นไป"],
  location: ["ใกล้ BTS", "ใกล้ MRT", "กรุงเทพกลาง", "กรุงเทพรอบนอก"],
};

const MOCK_QUESTIONS: Record<MissingField, string> = {
  search_goal: "คุณกำลังมองจะซื้อหรือเช่าครับ?",
  budget: "งบประมาณของคุณประมาณเท่าไรครับ?",
  location: "อยากได้ทำเลแถวไหนเป็นพิเศษไหมครับ?",
};

export async function generateClarification(
  missingFields: MissingField[],
  userMessage: string,
  sessionContext: Partial<ParsedIntent>
): Promise<ClarificationResult> {
  const field = FIELD_PRIORITY.find((f) => missingFields.includes(f)) ?? missingFields[0];

  const prompt = `ผู้ใช้พิมพ์: "${userMessage}"
ข้อมูลที่ทราบแล้ว: ${JSON.stringify(sessionContext)}
ข้อมูลที่ยังขาด: ${field}

สร้างคำถามกลับ 1 ข้อ สั้น เป็นกันเอง ภาษาไทย ไม่เกิน 20 คำ ถามเฉพาะเรื่อง ${field}
ห้ามถามหลายเรื่อง ห้ามใช้คำว่า "กรุณา"
Return: plain text เท่านั้น`;

  const question = (await geminiText(prompt, { temperature: 0.4 })) ?? MOCK_QUESTIONS[field];

  return {
    question,
    quick_replies: QUICK_REPLIES[field] ?? [],
    field_asking_about: field,
  };
}
