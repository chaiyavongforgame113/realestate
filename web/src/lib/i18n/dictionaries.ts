/** Shared translation dictionaries for common UI strings.
 *  Keys live in dot-notation (e.g. "nav.search"). Missing keys fall back to
 *  the key itself so we fail visibly rather than silently.
 */

export type Locale = "th" | "en" | "zh";

export const locales: { code: Locale; label: string; native: string; flag: string }[] = [
  { code: "th", label: "Thai", native: "ไทย", flag: "🇹🇭" },
  { code: "en", label: "English", native: "English", flag: "🇺🇸" },
  { code: "zh", label: "Chinese", native: "中文", flag: "🇨🇳" },
];

type Dict = Record<string, string>;

const th: Dict = {
  "nav.home": "หน้าแรก",
  "nav.search": "ค้นหา",
  "nav.map": "แผนที่",
  "nav.favorites": "รายการโปรด",
  "nav.appointments": "นัดหมาย",
  "nav.login": "เข้าสู่ระบบ",
  "nav.signup": "สมัครสมาชิก",
  "nav.account": "บัญชีของฉัน",
  "cta.search": "ค้นหา",
  "cta.book_viewing": "จองดูทรัพย์",
  "cta.contact_agent": "ติดต่อเอเจนต์",
  "cta.save": "บันทึก",
  "cta.share": "แชร์",
  "cta.compare": "เปรียบเทียบ",
  "cta.learn_more": "ดูรายละเอียด",
  "search.placeholder": "พิมพ์หรือพูด เช่น \"คอนโดใกล้ BTS 3 ล้าน 1 ห้องนอน\"",
  "filters.title": "ตัวกรอง",
  "filters.type.buy": "ซื้อ",
  "filters.type.rent": "เช่า",
  "filters.type.new": "โครงการใหม่",
  "filters.price": "ช่วงราคา",
  "filters.bedrooms": "ห้องนอน",
  "filters.area": "พื้นที่",
  "listing.bedrooms": "ห้องนอน",
  "listing.bathrooms": "ห้องน้ำ",
  "listing.area": "ตร.ม.",
  "listing.price_per_sqm": "บาท/ตร.ม.",
  "listing.transit": "ใกล้ขนส่ง",
  "listing.ai_recommended": "AI แนะนำ",
  "common.loading": "กำลังโหลด...",
  "common.error": "เกิดข้อผิดพลาด",
  "common.retry": "ลองใหม่",
  "common.cancel": "ยกเลิก",
  "common.confirm": "ยืนยัน",
  "common.save": "บันทึก",
  "common.close": "ปิด",
  "common.back": "ย้อนกลับ",
  "common.next": "ถัดไป",
  "lang.picker": "เลือกภาษา",
};

const en: Dict = {
  "nav.home": "Home",
  "nav.search": "Search",
  "nav.map": "Map",
  "nav.favorites": "Favorites",
  "nav.appointments": "Appointments",
  "nav.login": "Log in",
  "nav.signup": "Sign up",
  "nav.account": "Account",
  "cta.search": "Search",
  "cta.book_viewing": "Book a viewing",
  "cta.contact_agent": "Contact agent",
  "cta.save": "Save",
  "cta.share": "Share",
  "cta.compare": "Compare",
  "cta.learn_more": "Learn more",
  "search.placeholder":
    'Type or speak, e.g. "2BR condo near BTS under ฿3M"',
  "filters.title": "Filters",
  "filters.type.buy": "Buy",
  "filters.type.rent": "Rent",
  "filters.type.new": "New projects",
  "filters.price": "Price range",
  "filters.bedrooms": "Bedrooms",
  "filters.area": "Area",
  "listing.bedrooms": "beds",
  "listing.bathrooms": "baths",
  "listing.area": "sqm",
  "listing.price_per_sqm": "THB/sqm",
  "listing.transit": "Near transit",
  "listing.ai_recommended": "AI recommended",
  "common.loading": "Loading...",
  "common.error": "Something went wrong",
  "common.retry": "Retry",
  "common.cancel": "Cancel",
  "common.confirm": "Confirm",
  "common.save": "Save",
  "common.close": "Close",
  "common.back": "Back",
  "common.next": "Next",
  "lang.picker": "Language",
};

const zh: Dict = {
  "nav.home": "首页",
  "nav.search": "搜索",
  "nav.map": "地图",
  "nav.favorites": "收藏",
  "nav.appointments": "预约",
  "nav.login": "登录",
  "nav.signup": "注册",
  "nav.account": "账户",
  "cta.search": "搜索",
  "cta.book_viewing": "预约看房",
  "cta.contact_agent": "联系经纪人",
  "cta.save": "收藏",
  "cta.share": "分享",
  "cta.compare": "比较",
  "cta.learn_more": "查看详情",
  "search.placeholder": "请输入或说出，例如\"BTS附近两房公寓，300万以内\"",
  "filters.title": "筛选",
  "filters.type.buy": "出售",
  "filters.type.rent": "出租",
  "filters.type.new": "新楼盘",
  "filters.price": "价格范围",
  "filters.bedrooms": "卧室",
  "filters.area": "面积",
  "listing.bedrooms": "卧",
  "listing.bathrooms": "卫",
  "listing.area": "平米",
  "listing.price_per_sqm": "泰铢/平米",
  "listing.transit": "近公交",
  "listing.ai_recommended": "AI 推荐",
  "common.loading": "加载中...",
  "common.error": "出错了",
  "common.retry": "重试",
  "common.cancel": "取消",
  "common.confirm": "确认",
  "common.save": "保存",
  "common.close": "关闭",
  "common.back": "返回",
  "common.next": "下一步",
  "lang.picker": "语言",
};

export const dictionaries: Record<Locale, Dict> = { th, en, zh };

export function translate(locale: Locale, key: string, vars?: Record<string, string | number>) {
  const dict = dictionaries[locale] || dictionaries.th;
  let text = dict[key] ?? dictionaries.th[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return text;
}
