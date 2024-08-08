import mongoose from 'mongoose';
import { Comment } from '../models/comment.models.js';
import { ApiError } from '../utils/ApiError.js';
import { AsyncHandler } from '../utils/AsyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Recipe } from '../models/recipe.models.js';

const getRecipeComments = AsyncHandler(async (req, res) => {
	const { recipeId } = req.params;

	if (!recipeId) {
		return res.status(401).json(new ApiError(401, 'Invalid recipe id'));
	}

	const comments = await Comment.aggregate([
		{ $match: { recipe: new mongoose.Types.ObjectId(recipeId) } },
	]);

	return res
		.status(200)
		.json(
			new ApiResponse(200, comments, 'Successfully fetched all the comments')
		);
});

const addComment = AsyncHandler(async (req, res) => {
	const { recipeId } = req.params;
	const { content } = req.body;

	if (!recipeId) {
		return res.status(400).json(new ApiError(400, 'Recipe id is required'));
	}

	const recipe = await Recipe.findById(recipeId);

	if (!recipe) {
		return res.status(400).json(new ApiError(400, 'Recipe post not found'));
	}

	if (!content || content.trim() === '') {
		return res.status(400).json(new ApiError(400, 'Content is required'));
	}

	const comment = await Comment.create({
		content,
		owner: new mongoose.Types.ObjectId(req.user._id),
		recipe: new mongoose.Types.ObjectId(recipeId),
	});

	return res
		.status(200)
		.json(new ApiResponse(200, comment, 'Successfully added the comment'));
});

const updateComment = AsyncHandler(async (req, res) => {
	const { content } = req.body;
	const { commentId } = req.params;

	if (!content || content.trim() === '') {
		return res.status(400).json(new ApiError(400, 'Content is required'));
	}

	if (!commentId) {
		return res.status(400).json(new ApiError(400, 'Invalid comment id'));
	}

	const comment = await Comment.findById(commentId);

	if (!comment.owner.equals(req.user?._id)) {
		return res
			.status(401)
			.json(new ApiError(401, 'Only owner can modify comment'));
	}

	comment.content = content;

	const newComment = await comment.save();

	return res
		.status(200)
		.json(new ApiResponse(200, newComment, 'Successfully updated the comment'));
});

// TODO: give authority to recipe owner to delete the comments from his post
const deleteComment = AsyncHandler(async (req, res) => {
	const { commentId } = req.params;

	if (!commentId) {
		return res.status(400).json(new ApiError(400, 'Invalid comment id'));
	}

	const comment = await Comment.findById(commentId);

	if (!comment.owner.equals(req.user?._id)) {
		return res
			.status(401)
			.json(new ApiError(401, 'Only owner can delete the comment'));
	}

	await comment.deleteOne();

	return res
		.status(200)
		.json(new ApiResponse(200, 'Success', 'Successfully deleted the comment'));
});

export { addComment, getRecipeComments, updateComment, deleteComment };
