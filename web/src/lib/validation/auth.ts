import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("อีเมลไม่ถูกต้อง"),
  password: z
    .string()
    .min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัว")
    .regex(/[A-Z]/, "ต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว")
    .regex(/\d/, "ต้องมีตัวเลขอย่างน้อย 1 ตัว"),
  firstName: z.string().min(1, "กรุณากรอกชื่อ").optional(),
  lastName: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("อีเมลไม่ถูกต้อง"),
  password: z.string().min(1, "กรุณากรอกรหัสผ่าน"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
