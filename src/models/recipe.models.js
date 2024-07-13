import mongoose, { Schema } from 'mongoose';

const recipeSchema = new Schema(
	{
		title: {
			type: String,
			required: true,
			index: true,
		},
		description: {
			type: String,
			required: true,
		},
		ingredients: {
			type: [String],
			required: true,
		},
		instructions: {
			type: [String],
			required: true,
		},
		prepTime: {
			type: Number,
		},
		cookTime: {
			type: Number,
		},
		totalTime: {
			type: Number,
		},
		category: {
			type: String,
			required: true,
			index: true,
		},
		cuisine: {
			type: String,
		},
		imageUrl: {
			type: [String],
		},
		imagePublicId: {
			type: [String],
		},
		author: {
			type: Schema.Types.ObjectId,
			required: true,
		},
	},
	{ timestamps: true }
);

recipeSchema.pre('save', function (next) {
	if (!this.isModified('prepTime') || !this.isModified('cookTime'))
		return next();

	this.totalTime = this.prepTime + this.cookTime;
	next();
});

export const Recipe = mongoose.model('Recipe', recipeSchema);
