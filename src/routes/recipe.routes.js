import { Router } from 'express';
import {
	createRecipe,
	deleteRecipe,
	getRecipeById,
	getUserRecipies,
    updateRecipe,
} from '../controllers/recipe.controllers.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();
router.use(verifyJWT);

router.route('/post').post(
	upload.fields([
		{
			name: 'images',
			maxCount: 5,
		},
	]),
	createRecipe
);
router.route('/myrecipies').get(getUserRecipies);
router.route('/:recipeid').get(getRecipeById).patch(updateRecipe).delete(deleteRecipe);

export default router;
