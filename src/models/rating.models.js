import mongoose, { Schema } from 'mongoose';

const ratingSchema = new Schema(
	{
		rating: {
			type: Number,
			min: 1,
			max: 5,
			required: true,
		},
		recipe: {
			type: Schema.Types.ObjectId,
			ref: 'Recipe',
			required: true,
			index: true,
		},
		owner: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			index: true,
		},
	},
	{ timestamps: true }
);

export const Rating = mongoose.model('Rating', ratingSchema);
