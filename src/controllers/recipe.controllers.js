import { AsyncHandler } from '../utils/AsyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import {
	deleteAssetOnCloudinary,
	uploadPicturesOnCloudinary,
} from '../utils/cloudinary.js';
import { Recipe } from '../models/recipe.models.js';
import mongoose from 'mongoose';

const getAllRecipies = AsyncHandler(async (req, res) => {
	const { query, sortType = 'new', userId } = req.query;

	const pipeline = [];

	// if (query) {
	// 	pipeline.push({
	// 		$match: { $text: { $search: query, $caseSensitive: false } },
	// 	});
	// }
	if (userId) {
		pipeline.push({
			$match: { author: new mongoose.Types.ObjectId(userId) },
		});
	}

	const sortOrder = sortType === 'new' ? -1 : 1;
	pipeline.push({
		$sort: { createdAt: sortOrder },
	});

	let myAggregate;

	if (JSON.stringify(req.query) === '{}') {
		myAggregate = await Recipe.find().sort({ createdAt: -1 });
	}

	if (!(JSON.stringify(req.query) === '{}')) {
		myAggregate = await Recipe.aggregate(pipeline);
	}

	if (!myAggregate || myAggregate.length === 0) {
		return res.status(500).json(new ApiError(500, 'Failed to fetch recipies'));
	}

	return res
		.status(200)
		.json(
			new ApiResponse(200, myAggregate, 'Successfully fetched all the recipies')
		);
});

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

	if (!title) {
		return res.status(400).json(new ApiError(400, 'Title is missing'));
	}
	if (!description) {
		return res.status(400).json(new ApiError(400, 'Description is missing'));
	}
	if (!ingredients) {
		return res.status(400).json(new ApiError(400, 'Ingredients are missing'));
	}
	if (!instructions) {
		return res.status(400).json(new ApiError(400, 'Instructions are missing'));
	}
	if (!category) {
		return res.status(400).json(new ApiError(400, 'Category is missing'));
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
		return res.status(400).json(new ApiError(400, 'Recipe id not found'));
	}

	const recipe = await Recipe.findById(recipeid);

	if (!recipe) {
		return res.status(401).json(new ApiError(401, 'Post not found in DB'));
	}

	if (!recipe.author.equals(req.user._id)) {
		return res
			.status(401)
			.json(new ApiError(401, 'Only post author is allowed to edit the post'));
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

	if (!userid) {
		return res.status(400).json(new ApiError(400, 'Please provide user id'));
	}

	const userRecipies = await Recipe.aggregate([
		{
			$match: { author: new mongoose.Types.ObjectId(userid) },
		},
	]);

	if (Array.isArray(userRecipies) && userRecipies.length === 0) {
		return res
			.status(401)
			.json(new ApiError(401, 'No recipe posted by this user'));
	}

	return res
		.status(200)
		.json(new ApiResponse(200, userRecipies, 'Successfully fetched recipies'));
});

const updateImages = AsyncHandler(async (req, res) => {
	//TODO: take images from req.files upload new images on cloudinary and delete old ones

	const { recipeid } = req.params;

	const recipe = await Recipe.findById(recipeid);

	if (!recipe) {
		return res.status(400).json(new ApiError(400, 'No recipe found'));
	}

	if (!recipe.author.equals(req.user._id)) {
		return res
			.status(401)
			.json(new ApiError(401, 'Only author is allowed to update the post'));
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
		console.log('New Images uploaded successfully');
	}

	const deleteImageOnCloudinary = async () => {
		const publicIds = recipe.imagePublicId;

		for (let i = 0; i < publicIds.length; i++) {
			await deleteAssetOnCloudinary(publicIds[i]);
		}
	};

	if (recipe.imagePublicId.length > 0) {
		await deleteImageOnCloudinary();
		console.log('Deleted old images from cloudinary');
	}

	recipe.imageUrl = urlArray;
	recipe.imagePublicId = publicIdArray;

	await recipe.save();

	return res
		.status(200)
		.json(
			new ApiResponse(200, urlArray, 'Successfully updated all the images')
		);
});

const deleteImages = AsyncHandler(async (req, res) => {
	const { recipeid } = req.params;

	if (!recipeid) {
		return res.status(401).json(new ApiError(401, 'Recipe id not found'));
	}

	const recipe = await Recipe.findById(recipeid);

	if (!recipe) {
		return res.status(401).json(new ApiError(401, 'No recipe found'));
	}

	if (!recipe.author.equals(req.user._id)) {
		return res
			.status(401)
			.json(new ApiError(401, 'Only author is allowed to update the post'));
	}

	if (recipe.imagePublicId.length === 0) {
		return res.status(401).json(new ApiError(401, 'No image found'));
	}

	const deleteImageOnCloudinary = async () => {
		const publicIds = recipe.imagePublicId;

		for (let i = 0; i < publicIds.length; i++) {
			await deleteAssetOnCloudinary(publicIds[i]);
		}
	};

	await deleteImageOnCloudinary();
	console.log('Deleted old images from cloudinary');

	recipe.imageUrl = [];
	recipe.imagePublicId = [];
	await recipe.save();

	return res
		.status(200)
		.json(
			new ApiResponse(200, 'Success', 'Successfully deleted all the images')
		);
});

const deleteRecipe = AsyncHandler(async (req, res) => {
	const { recipeid } = req.params;

	if (!recipeid) {
		return res.status(400).json(new ApiError(400, 'No recipe id found'));
	}

	const recipe = await Recipe.findById(recipeid);

	if (!recipe) {
		return res.status(404).json(new ApiError(404, 'Recipe not found'));
	}

	if (!recipe.author.equals(req.user._id)) {
		return res
			.status(401)
			.json(
				new ApiError(401, 'Only post author is allowed to delete the post')
			);
	}

	await recipe.deleteOne();

	return res
		.status(200)
		.json(new ApiResponse(200, 'Success', 'Successfully deleted the recipe'));
});

const getRecipeById = AsyncHandler(async (req, res) => {
	const { recipeid } = req.params;

	const recipe = await Recipe.findById(recipeid).select('-imagePublicId');

	return res
		.status(200)
		.json(new ApiResponse(200, recipe, 'Successfully fetched the post'));
});

const getRecipeAuthorDetails = AsyncHandler(async (req, res) => {
	const { recipeid } = req.params;

	if (!recipeid) {
		return res.status(401).json(new ApiError(401, 'Recipe id not found'));
	}

	const recipe = await Recipe.aggregate([
		{
			$match: { _id: new mongoose.Types.ObjectId(recipeid) },
		},
		{
			$lookup: {
				from: 'users',
				localField: 'author',
				foreignField: '_id',
				as: 'author',
			},
		},
		{
			$unwind: '$author',
		},
		{
			$project: {
				'author._id': 1,
				'author.username': 1,
				'author.fullName': 1,
				'author.email': 1,
				'author.avatar': 1,
			},
		},
	]);

	if (Array.isArray(recipe) && recipe.length === 0) {
		return res.status(401).json(new ApiError(401, 'No recipe found'));
	}

	return res
		.status(200)
		.json(
			new ApiResponse(
				200,
				recipe[0].author,
				'Successfully fetched recipe author details'
			)
		);
});

export {
	createRecipe,
	getUserRecipies,
	updateRecipe,
	getRecipiesByUserId,
	updateImages,
	deleteRecipe,
	getRecipeById,
	getRecipeAuthorDetails,
	deleteImages,
	getAllRecipies,
};
