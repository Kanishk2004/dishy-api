import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { userDashboard } from '../controllers/dashboard.controllers.js';

const router = Router();
router.use(verifyJWT);

router.route('/').get(userDashboard);

export default router;
