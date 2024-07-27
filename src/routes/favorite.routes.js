import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {
	deleteFavorites,
	getUserFavorites,
	toggleFavorite,
} from '../controllers/favorite.controllers.js';

const router = Router();
router.use(verifyJWT);

router.route('/').get(getUserFavorites);
router.route('/toggle/:recipeId').post(toggleFavorite);
router.route('/delete').delete(deleteFavorites);

export default router;
