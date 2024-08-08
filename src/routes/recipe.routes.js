import { Router } from 'express';
import {
	createRecipe,
	deleteImages,
	deleteRecipe,
	getAllRecipies,
	getRecipeAuthorDetails,
	getRecipeById,
	getRecipiesByUserId,
	getUserRecipies,
	updateImages,
	updateRecipe,
} from '../controllers/recipe.controllers.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();
// router.use(verifyJWT);

router.route('/').get(getAllRecipies);
router.route('/post').post(
	upload.fields([
		{
			name: 'images',
			maxCount: 5,
		},
	]),
	verifyJWT,
	createRecipe
);
router.route('/myrecipies').get(verifyJWT, getUserRecipies);
router
	.route('/:recipeid')
	.get(getRecipeById)
	.patch(verifyJWT, updateRecipe)
	.delete(verifyJWT, deleteRecipe);
router.route('/u/:userid').get(getRecipiesByUserId);
router.route('/author/:recipeid').get(getRecipeAuthorDetails);
router
	.route('/image/:recipeid')
	.patch(
		upload.fields([
			{
				name: 'images',
				maxCount: 5,
			},
		]),
		verifyJWT,
		updateImages
	)
	.delete(verifyJWT, deleteImages);

export default router;
