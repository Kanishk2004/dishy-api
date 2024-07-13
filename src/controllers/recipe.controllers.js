import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadPicturesOnCloudinary } from "../utils/cloudinary.js";
import { Recipe } from "../models/recipe.models.js";
import mongoose from "mongoose";

const createRecipe = AsyncHandler(async (req, res) => {
	const { title, description, ingredients, instructions, prepTime, cookTime, category, cuisine } = req.body;

	if (!title & !description & !ingredients & !instructions & !category) {
		throw new ApiError(401, "Required fields are missing");
	}

	let urlArray = [];
	let publicIdArray = [];

	const recipeImageUploader = async () => {
		let localpathArray = [];

		//creating an array of local file paths
		req.files?.images.map(async (image) => {
			localpathArray.push(image.path);
		});

		//for loop to loop through every local path saved in localPathArray and upload it on cloudinary
		for (let i = 0; i < localpathArray.length; i++) {
			const uploadedImage = await uploadPicturesOnCloudinary(localpathArray[i]);
			urlArray.push(uploadedImage.url);
			publicIdArray.push(uploadedImage.public_id);
		}
	};

	if (Array.isArray(req.files?.images)) {
		await recipeImageUploader();
	}

	const recipe = await Recipe.create({
		title,
		description,
		ingredients,
		instructions,
		prepTime: prepTime || 10,
		cookTime: cookTime || 20,
		category,
		cuisine: cuisine || "not mentioned",
		imageUrl: urlArray,
		imagePublicId: publicIdArray,
		author: new mongoose.Types.ObjectId(req.user._id),
	});

	return res.status(200).json(new ApiResponse(200, recipe, "Successfully posted the recipe"));
});

export { createRecipe };
