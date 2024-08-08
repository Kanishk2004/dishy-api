import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {
	addRating,
	deleteRating,
	getAverageRecipeRating,
	getRecipeRatings,
	updateRating,
} from '../controllers/rating.controllers.js';

const router = Router();
// router.use(verifyJWT);

router.route('/:recipeId').get(getRecipeRatings);
router.route('/avg/:recipeId').get(getAverageRecipeRating);
router.route('/add/:recipeId').post(verifyJWT, addRating);
router
	.route('/:ratingId')
	.patch(verifyJWT, updateRating)
	.delete(verifyJWT, deleteRating);

export default router;
