import { Megaphone } from "lucide-react";
import { ComingSoon } from "@/components/dashboard/coming-soon";

export default function AgentPromotePage() {
  return (
    <ComingSoon
      icon={Megaphone}
      title="โปรโมทประกาศ"
      description="ใช้แพ็กเกจเพื่อเลื่อนประกาศขึ้นด้านบน เพิ่ม view และ lead ได้เร็วขึ้น"
      backHref="/agent"
      backLabel="กลับสู่ Dashboard"
      features={[
        "Boost ประกาศ 7/30 วัน",
        "แบดจ์ Featured บนการ์ด",
        "Priority ในผลการค้นหา",
        "Analytics เปรียบเทียบก่อน-หลัง",
      ]}
    />
  );
}
