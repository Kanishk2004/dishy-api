import mongoose from 'mongoose';
import { Rating } from '../models/rating.models.js';
import { AsyncHandler } from '../utils/AsyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { Recipe } from '../models/recipe.models.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const getRecipeRatings = AsyncHandler(async (req, res) => {
	const { recipeId } = req.params;

	const ratings = await Rating.aggregate([
		{
			$match: { recipe: new mongoose.Types.ObjectId(recipeId) },
		},
	]);

	return res
		.status(200)
		.json(new ApiResponse(200, ratings, 'Successfully fetched recipe ratings'));
});

const getAverageRecipeRating = AsyncHandler(async (req, res) => {
	const { recipeId } = req.params;

	const result = await Rating.aggregate([
		{
			$match: { recipe: new mongoose.Types.ObjectId(recipeId) },
		},
		{
			$group: {
				_id: '$recipe',
				avgRating: { $avg: '$rating' },
				ratingCount: { $sum: 1 },
			},
		},
	]);

	if (!(Array.isArray(result) && result.length > 0)) {
		return res
			.status(200)
			.json(
				new ApiResponse(
					200,
					{ avgRating: 0, ratingCount: 0 },
					'No rating found'
				)
			);
	}

	const { avgRating, ratingCount } = result[0];

	return res
		.status(200)
		.json(
			new ApiResponse(
				200,
				{ avgRating, ratingCount },
				'Successfully fetched recipe average ratings'
			)
		);
});

const addRating = AsyncHandler(async (req, res) => {
	const { recipeId } = req.params;
	const { rate } = req.body;

	if (!recipeId) {
		return res.status(400).json(new ApiError(400, 'Recipe id is required'));
	}

	const recipe = await Recipe.findById(recipeId);

	if (!recipe) {
		return res.status(400).json(new ApiError(401, 'Invalid recipe id'));
	}

	if (rate > 5 || rate < 1) {
		return res
			.status(400)
			.json(new ApiError(400, 'Rating should be between 1 and 5'));
	}

	const rating = await Rating.create({
		rating: rate,
		recipe: new mongoose.Types.ObjectId(recipeId),
		owner: new mongoose.Types.ObjectId(req.user?._id),
	});

	return res
		.status(200)
		.json(new ApiResponse(200, rating, 'Successfully rated the recipe'));
});

const updateRating = AsyncHandler(async (req, res) => {
	const { ratingId } = req.params;
	const { rate } = req.body;

	if (rate > 5 || rate < 0) {
		return res
			.status(400)
			.json(new ApiError(400, 'Rating should be between 0 and 5'));
	}

	const rating = await Rating.findById(ratingId);

	if (!rating.owner.equals(req.user?._id)) {
		return res
			.status(401)
			.json(new ApiError(401, 'Only rating owner is allowed to update rating'));
	}

	rating.rating = rate;
	const newRating = await rating.save();

	return res
		.status(200)
		.json(new ApiResponse(200, newRating, 'Successfully updated the rating'));
});

const deleteRating = AsyncHandler(async (req, res) => {
	const { ratingId } = req.params;

	if (!ratingId) {
		return res.status(400).json(new ApiError(400, 'Rating id is required'));
	}

	const rating = await Rating.findById(ratingId);

	if (!rating.owner.equals(req.user?._id)) {
		return res
			.status(401)
			.json(new ApiError(401, 'Only rating owner is allowed to delete rating'));
	}

	await rating.deleteOne();

	return res
		.status(200)
		.json(new ApiResponse(200, 'Success', 'Successfully deleted the rating'));
});

export {
	getRecipeRatings,
	getAverageRecipeRating,
	addRating,
	updateRating,
	deleteRating,
};
