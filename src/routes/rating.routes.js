import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {
	addRating,
	deleteRating,
	getAverageRecipeRating,
	getRecipeRatings,
	getUserRatings,
	updateRating,
} from '../controllers/rating.controllers.js';

const router = Router();
router.use(verifyJWT);

router.route('/:recipeId').get(getRecipeRatings).post(addRating);
router.route('/user/:userid').get(getUserRatings);
router.route('/avg/:recipeId').get(getAverageRecipeRating);
router.route('/:ratingId').patch(updateRating).delete(deleteRating);

export default router;
