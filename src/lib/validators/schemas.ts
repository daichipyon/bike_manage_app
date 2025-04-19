import { z } from 'zod';

// Resident Schema
export const residentSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "名前は必須項目です"),
  room_number: z.string().min(1, "部屋番号は必須項目です"),
  contact_info: z.string().min(1, "連絡先は必須項目です"),
  status: z.enum(["active", "inactive"]).default("active"),
});

export type ResidentFormValues = z.infer<typeof residentSchema>;

// Bicycle Slot Schema
export const bicycleSlotSchema = z.object({
  id: z.number().optional(),
  slot_code: z.string().min(1, "スロットコードは必須項目です"),
  location: z.string().min(1, "ロケーションは必須項目です"),
  resident_id: z.number().nullable().optional(),
  status: z.enum(["available", "occupied", "maintenance"]).default("available"),
});

export type BicycleSlotFormValues = z.infer<typeof bicycleSlotSchema>;

// Sticker Schema
export const stickerSchema = z.object({
  id: z.number().optional(),
  slot_id: z.number(),
  sticker_number: z.string().min(1, "ステッカー番号は必須項目です"),
  issued_date: z.string().min(1, "発行日は必須項目です"),
});

export type StickerFormValues = z.infer<typeof stickerSchema>;

// Violation Log Schema
export const violationLogSchema = z.object({
  id: z.number().optional(),
  location: z.string().min(1, "ロケーションは必須項目です"),
  memo: z.string().optional(),
  photo_url: z.string().optional(),
  reported_at: z.string().min(1, "報告日時は必須項目です"),
});

export type ViolationLogFormValues = z.infer<typeof violationLogSchema>;

// Payment Schema
export const paymentSchema = z.object({
  id: z.number().optional(),
  resident_id: z.number(),
  month: z.string().min(1, "月は必須項目です"),
  amount: z.number().min(0, "金額は0以上である必要があります"),
  paid_at: z.string().nullable().optional(),
  status: z.enum(["unpaid", "paid"]).default("unpaid"),
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;

// Assignment Schema (combines resident selection and slot assignment)
export const assignmentSchema = z.object({
  resident_id: z.number().optional(),
  // For new resident creation
  resident: z.object({
    name: z.string().min(1, "名前は必須項目です"),
    room_number: z.string().min(1, "部屋番号は必須項目です"),
    contact_info: z.string().min(1, "連絡先は必須項目です"),
  }).optional(),
  slot_id: z.number(),
  sticker_number: z.string().min(1, "ステッカー番号は必須項目です"),
  issued_date: z.string().min(1, "発行日は必須項目です"),
});

export type AssignmentFormValues = z.infer<typeof assignmentSchema>;

// Login Schema
export const loginSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(6, "パスワードは6文字以上必要です"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;