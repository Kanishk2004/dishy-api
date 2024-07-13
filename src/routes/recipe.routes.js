import { Router } from "express";
import { createRecipe } from "../controllers/recipe.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router.use(verifyJWT);

router.route("/post-recipe").post(
	upload.fields([
		{
			name: "images",
			maxCount: 5,
		},
	]),
	createRecipe
);

export default router;
