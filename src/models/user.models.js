import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
	{
		username: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
			index: true,
		},
		fullName: {
			type: String,
			required: true,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			index: true,
		},
		isEmailVerified: {
			type: Boolean,
			default: false,
		},
		phone: {
			type: Number,
			required: true,
			unique: true,
		},
		isPhoneVerified: {
			type: Boolean,
			default: false,
		},
		password: {
			type: String,
			required: true,
		},
		avatar: {
			type: String,
			required: true,
		},
		avatarPublicId: {
			type: String,
			required: true,
		},
		bio: {
			type: String,
			required: true,
		},
		gender: {
			type: String,
			enum: {
				values: ["male", "female"],
				message: "Select only from Male or Female",
			},
		},
		isAdmin: {
			type: Boolean,
			default: false,
		},
		refreshToken: {
			type: String,
		},
	},
	{ timestamps: true }
);

userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) return next();

	this.password = await bcrypt.hash(this.password, 10);
	next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
	return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
	return jwt.sign(
		{
			_id: this._id,
			email: this._id,
			username: this.username,
			fullName: this.fullName,
			isAdmin: this.isAdmin,
		},
		process.env.ACCESS_TOKEN_SECRET,
		{
			expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
		}
	);
};

userSchema.methods.generateRefreshToken = function () {
	return jwt.sign(
		{
			_id: this._id,
		},
		process.env.REFRESH_TOKEN_SECRET,
		{
			expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
		}
	);
};

export const User = mongoose.model("User", userSchema);
