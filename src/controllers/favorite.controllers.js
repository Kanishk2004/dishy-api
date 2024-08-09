import mongoose from 'mongoose';
import { Favorite } from '../models/favorite.models.js';
import { AsyncHandler } from '../utils/AsyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

const toggleFavorite = AsyncHandler(async (req, res) => {
	// get the recipe id from the params
	// check if the favorite document already created for the user
	// if already present - add or remove the recipe id from the recipes array
	// return the favorite document

	const { recipeId } = req.params;

	let favorite = await Favorite.findOne({
		owner: new mongoose.Types.ObjectId(req.user?._id),
	});

	if (!favorite) {
		favorite = new Favorite({
			owner: new mongoose.Types.ObjectId(req.user?._id),
		});
		favorite.recipies.push(recipeId);
	} else {
		const recipeIndex = favorite.recipies.indexOf(recipeId);

		if (recipeIndex > -1) {
			favorite.recipies.splice(recipeIndex, 1);
		} else {
			favorite.recipies.push(recipeId);
		}
	}
	const updatedFavorites = await favorite.save();

	return res
		.status(200)
		.json(
			new ApiResponse(200, updatedFavorites, 'Favorite updated successfully')
		);
});

const deleteFavorites = AsyncHandler(async (req, res) => {
	await Favorite.findOneAndDelete({ owner: req.user?._id });

	return res
		.status(200)
		.json(new ApiResponse(200, 'success', 'Successfully deleted favorites'));
});

const getUserFavorites = AsyncHandler(async (req, res) => {
	const favorites = await Favorite.aggregate([
		{
			$match: { owner: req.user?._id },
		},
	]);

	if (Array.isArray(favorites) && favorites.length === 0) {
		return res.status(400).json(new ApiError(400, 'User has no favorites'));
	}

	return res
		.status(200)
		.json(
			new ApiResponse(200, favorites[0], 'Successfully fetched user favorites')
		);
});

export { toggleFavorite, deleteFavorites, getUserFavorites };
