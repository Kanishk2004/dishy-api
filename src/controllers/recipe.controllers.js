import { AsyncHandler } from '../utils/AsyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { uploadPicturesOnCloudinary } from '../utils/cloudinary.js';
import { Recipe } from '../models/recipe.models.js';
import mongoose from 'mongoose';

const createRecipe = AsyncHandler(async (req, res) => {
	const {
		title,
		description,
		ingredients,
		instructions,
		prepTime,
		cookTime,
		category,
		cuisine,
	} = req.body;

	if (!title && !description && !ingredients && !instructions && !category) {
		throw new ApiError(401, 'Required fields are missing');
	}

	let urlArray = [];
	let publicIdArray = [];

	const recipeImageUploader = async () => {
		let localPathArray = [];

		//creating an array of local file paths
		req.files?.images.map((image) => {
			localPathArray.push(image.path);
		});

		//for loop to loop through every local path saved in localPathArray and upload it on cloudinary
		for (let i = 0; i < localPathArray.length; i++) {
			const uploadedImage = await uploadPicturesOnCloudinary(localPathArray[i]);
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
		prepTime: prepTime || 0,
		cookTime: cookTime || 0,
		category,
		cuisine: cuisine || 'not mentioned',
		imageUrl: urlArray,
		imagePublicId: publicIdArray,
		author: new mongoose.Types.ObjectId(req.user._id),
	});

	return res
		.status(200)
		.json(new ApiResponse(200, recipe, 'Successfully posted the recipe'));
});

const getUserRecipies = AsyncHandler(async (req, res) => {
	const userId = req.user._id;

	const userRecipies = await Recipe.aggregate([
		{
			$match: { author: new mongoose.Types.ObjectId(userId) },
		},
	]);

	return res
		.status(200)
		.json(
			new ApiResponse(200, userRecipies, 'Successfully fetched user recipies')
		);
});

const updateRecipe = AsyncHandler(async (req, res) => {
	const { recipeid } = req.params;

	if (!recipeid) {
		throw new ApiError(401, 'Recipe id not found');
	}

	const recipe = await Recipe.findById(recipeid);

	if (!recipe) {
		throw new ApiError(401, 'Post not found in DB');
	}

	if (!recipe.author.equals(req.user._id)) {
		throw new ApiError(401, 'Only post author is allowed to edit the post');
	}

	const {
		title,
		description,
		ingredients,
		instructions,
		prepTime,
		cookTime,
		category,
		cuisine,
	} = req.body;

	if (title) recipe.title = title;
	if (description) recipe.description = description;
	if (ingredients) recipe.ingredients = ingredients;
	if (instructions) recipe.instructions = instructions;
	if (prepTime) recipe.prepTime = prepTime;
	if (cookTime) recipe.cookTime = cookTime;
	if (category) recipe.category = category;
	if (cuisine) recipe.cuisine = cuisine;

	await recipe.save();

	const updatedRecipe = await Recipe.findById(recipeid);

	return res
		.status(200)
		.json(new ApiResponse(200, updatedRecipe, 'Successfully updated the post'));
});

const getRecipiesByUserId = AsyncHandler(async (req, res) => {
	const { userid } = req.params;
});

const updateImages = AsyncHandler(async (req, res) => {
	//TODO: take images from req.files upload new images on cloudinary and delete old ones
});

const deleteRecipe = AsyncHandler(async (req, res) => {
	const { recipeid } = req.params;
});

const getRecipeById = AsyncHandler(async (req, res) => {
	const { recipeid } = req.params;
});

export {
	createRecipe,
	getUserRecipies,
	updateRecipe,
	getRecipiesByUserId,
	updateImages,
	deleteRecipe,
	getRecipeById,
};
