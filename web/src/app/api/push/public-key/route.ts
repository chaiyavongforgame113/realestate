import { NextResponse } from "next/server";
import { vapidPublic } from "@/lib/push/vapid";

export async function GET() {
  return NextResponse.json({ key: vapidPublic() });
}
