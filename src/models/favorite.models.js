import mongoose, { Schema } from 'mongoose';

const favoriteSchema = new Schema(
	{
		owner: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			index: true,
		},
		recipies: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Recipe',
			},
		],
	},
	{ timestamps: true }
);

export const Favorite = mongoose.model('Favorite', favoriteSchema);
