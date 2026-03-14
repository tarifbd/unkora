import { z } from "zod";
import { bdPhone } from "@unkora/utils";

export const RegisterPhoneSchema = z.object({ phone: bdPhone });

export const VerifyOtpSchema = z.object({
  phone: bdPhone,
  otp: z.string().length(6).regex(/^\d+$/),
  name_en: z.string().min(2).max(100).optional(),
  name_bn: z.string().min(2).max(100).optional(),
});

export const RegisterEmailSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, "Password needs uppercase, number, special char"),
  name_en: z.string().min(2).max(100),
  name_bn: z.string().min(2).max(100).optional(),
});

export const LoginEmailSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const LoginPinSchema = z.object({
  phone: bdPhone,
  pin: z.string().length(4).regex(/^\d+$/),
});

export const SocialLoginSchema = z.object({
  provider: z.enum(["google", "facebook"]),
  token: z.string().min(1),
});

export const SetPinSchema = z.object({
  pin: z.string().length(4).regex(/^\d+$/, "PIN must be 4 digits"),
  confirm_pin: z.string().length(4),
}).refine((d) => d.pin === d.confirm_pin, { message: "PINs do not match", path: ["confirm_pin"] });

export const VerifyTotpSchema = z.object({ token: z.string().length(6).regex(/^\d+$/) });

export const PasswordResetRequestSchema = z.object({ email: z.string().email() });

export const PasswordResetConfirmSchema = z.object({
  token: z.string().min(32),
  password: z.string().min(8),
  confirm_password: z.string(),
}).refine((d) => d.password === d.confirm_password, { message: "Passwords do not match", path: ["confirm_password"] });
