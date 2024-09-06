import { Router } from 'express';
import {
	registerUser,
	login,
	logoutUser,
	refreshAccessToken,
	sendEmailOtp,
	verifyOtp,
	forgotPasswordLink,
	resetPassword,
	changePassword,
	getCurrentUser,
	updateUserDetails,
	updateAvatar,
	userProfile,
	userRatings,
	myStats,
	deleteAccount,
} from '../controllers/user.controllers.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

router.route('/register').post(upload.single('avatar'), registerUser);
router.route('/login').post(login);
router.route('/logout').post(verifyJWT, logoutUser);
router.route('/refresh-token').post(verifyJWT, refreshAccessToken);
router
	.route('/verify-email')
	.post(verifyJWT, sendEmailOtp)
	.patch(verifyJWT, verifyOtp);
router.route('/forgot-password').post(forgotPasswordLink).patch(resetPassword);
router.route('/change-password').post(verifyJWT, changePassword);
router
	.route('/me')
	.get(verifyJWT, getCurrentUser)
	.patch(verifyJWT, updateUserDetails)
	.delete(verifyJWT, deleteAccount);
router.route('/avatar').patch(verifyJWT, upload.single('avatar'), updateAvatar);
router.route('/u/:username').get(userProfile);

router.route('/myratings').get(verifyJWT, userRatings);
router.route('/mystats').get(verifyJWT, myStats);
export default router;
