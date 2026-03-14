import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as ctrl from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// Strict rate limit for auth endpoints
const authLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, code: "RATE_LIMITED", message: "Too many auth attempts" },
});

const otpLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: { success: false, code: "RATE_LIMITED", message: "Too many OTP requests" },
});

// Phone registration
router.post("/register/phone", otpLimit, ctrl.registerPhone);
router.post("/register/phone/verify", authLimit, ctrl.verifyPhoneRegistration);

// Email registration
router.post("/register/email", authLimit, ctrl.registerEmail);
router.get("/verify-email/:token", ctrl.verifyEmail);

// Login
router.post("/login/phone", otpLimit, ctrl.loginPhone);
router.post("/login/phone/verify", authLimit, ctrl.verifyPhoneLogin);
router.post("/login/email", authLimit, ctrl.loginEmail);
router.post("/login/social", authLimit, ctrl.loginSocial);

// Token management
router.post("/refresh", ctrl.refreshToken);
router.post("/logout", authenticate, ctrl.logout);
router.post("/logout/all", authenticate, ctrl.logoutAll);

// Password
router.post("/password/reset/request", authLimit, ctrl.requestPasswordReset);
router.post("/password/reset/confirm", authLimit, ctrl.confirmPasswordReset);

// PIN
router.post("/pin/set", authenticate, ctrl.setupPIN);
router.post("/pin/login", authLimit, ctrl.pinLogin);

// Sessions
router.get("/sessions", authenticate, ctrl.getSessions);
router.delete("/sessions/:sessionId", authenticate, ctrl.revokeSession);

// 2FA
router.post("/2fa/setup", authenticate, ctrl.setup2FA);
router.post("/2fa/verify", authenticate, ctrl.verify2FA);
router.post("/2fa/disable", authenticate, ctrl.disable2FA);

// Profile
router.get("/me", authenticate, ctrl.getMe);
router.patch("/me", authenticate, ctrl.updateMe);

export default router;
