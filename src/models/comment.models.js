import mongoose, { Schema } from 'mongoose';

const commentSchema = new Schema(
	{
		content: {
			type: String,
			required: true,
		},
		owner: {
			type: Schema.Types.ObjectId,
			required: true,
			index: true,
		},
		recipe: {
			type: Schema.Types.ObjectId,
			required: true,
			index: true,
		},
	},
	{
		timestamps: true,
	}
);

export const Comment = mongoose.model('Comment', commentSchema);
