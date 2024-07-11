import { Router } from "express";
import { login, logoutUser, registerUser, sendEmailOtp, verifyOtp } from "../controllers/user.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/register").post(upload.single("avatar"), registerUser);
router.route("/login").post(login);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/verify-email/gen-otp").post(verifyJWT, sendEmailOtp);
router.route("/verify-email/otp").post(verifyJWT, verifyOtp);

export default router;
