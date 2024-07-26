import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {
	addComment,
	deleteComment,
	getRecipeComments,
	updateComment,
} from '../controllers/comment.controllers.js';

const router = Router();
router.use(verifyJWT);

router.route('/:recipeId').get(getRecipeComments);
router.route('/add/:recipeId').post(addComment);
router.route('/:commentId').patch(updateComment).delete(deleteComment);

export default router;
