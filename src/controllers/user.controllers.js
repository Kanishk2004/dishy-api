import { User } from '../models/user.models.js';
import crypto from 'crypto';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { AsyncHandler } from '../utils/AsyncHandler.js';
import {
	deleteAssetOnCloudinary,
	uploadAvatarOnCloudinary,
} from '../utils/cloudinary.js';
import {
	generateOtp,
	sendForgotPasswordMail,
	sendMail,
} from '../utils/sendEmail.js';
import { Rating } from '../models/rating.models.js';
import { Favorite } from '../models/favorite.models.js';
import { Recipe } from '../models/recipe.models.js';
import mongoose, { mongo } from 'mongoose';

// const genOtp = generateOtp(6);

const generateAccessAndRefreshToken = async (userId) => {
	try {
		const user = await User.findById(userId);
		const accessToken = user.generateAccessToken();
		const refreshToken = user.generateRefreshToken();

		user.refreshToken = refreshToken;
		await user.save({ validateBeforeSave: false });
		return { accessToken, refreshToken };
	} catch (error) {
		return res
			.status(500)
			.json(
				new ApiError(
					500,
					'Something went wrong while generating access and refresh token'
				)
			);
	}
};

const registerUser = AsyncHandler(async (req, res) => {
	//get username, fullName, email, phone, avatar, gender from req.body
	//validate if all fields are provided
	//check if user already exists - email and username must be unique
	//check for avatar OR upload noAvatar.png from backend
	//then upload image file to cloudinary
	//create user object - create entry in db
	//remove password and refreshToken from response
	//check if user created successfully?
	//return user

	const { username, fullName, email, password, phone, gender } = req.body;

	if (!(username, fullName, email, phone, gender, password)) {
		return res.status(400).json(new ApiError(400, 'All fields are required'));
	}

	const existedUser = await User.findOne({
		$or: [{ username }, { email }, { phone }],
	});

	if (existedUser) {
		// console.log(existedUser);
		return res
			.status(400)
			.json(
				new ApiError(400, 'User with email or username or phone already exists')
			);
	}

	let avatarLocalPath = req.file?.path;

	if (!avatarLocalPath) {
		return res.status(400).json(new ApiError(400, 'Avatar is required'));
		// avatarLocalPath = "./public/noavatar.png";
	}

	const avatar = await uploadAvatarOnCloudinary(avatarLocalPath);

	if (!avatar) {
		return res
			.status(500)
			.json(new ApiError(500, 'Avatar cloudinary upload failed!'));
	}

	const user = await User.create({
		username,
		fullName,
		email,
		phone,
		gender,
		password,
		avatar: avatar?.url,
		avatarPublicId: avatar?.public_id,
		bio: 'update your bio',
	});

	const newUser = await User.findById(user._id).select(
		'-password -refreshToken'
	);

	if (!newUser) {
		return res
			.status(500)
			.json(new ApiError(500, 'Failed to register the user'));
	}

	return res
		.status(200)
		.json(
			new ApiResponse(200, newUser, 'Successfully registered the new user')
		);
});

const login = AsyncHandler(async (req, res) => {
	// req.body -> data
	// username or email
	// find the user
	// password check
	// access and refresh token
	// send cookie

	const { email, username, password } = req.body;

	if (!(username || email)) {
		// same as - if(!username && !email)
		return res
			.status(400)
			.json(new ApiError(400, 'username or email is required'));
	}

	const user = await User.findOne({
		$or: [{ username }, { email }],
	});

	if (!user) {
		return res.status(404).json(new ApiError(404, 'user does not exists!'));
	}

	// using "user" instead of "User" because User methods like (User.findOne) is available through mongoose but the methods we created in user model file is accessed by using "user"
	const isPasswordValid = await user.isPasswordCorrect(password);
	if (!isPasswordValid) {
		return res.status(401).json(new ApiError(401, 'Invalid user credentials'));
	}
	const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
		user._id
	);

	const loggedInUser = await User.aggregate([
		{
			$match: { _id: new mongoose.Types.ObjectId(user?._id) },
		},
		{
			$lookup: {
				from: 'favorites',
				localField: '_id',
				foreignField: 'owner',
				as: 'userFavorites',
				pipeline: [
					{
						$project: {
							recipies: 1,
						},
					},
				],
			},
		},
		{
			$addFields: {
				userFavorites: { $arrayElemAt: ['$userFavorites', 0] },
			},
		},
		{
			$project: {
				password: 0,
				refreshToken: 0,
			},
		},
	]);

	const options = {
		httpOnly: true, //by default anybody can modify your cookie from frontend by giving these options cookies can only be modified on the server
		secure: true,
		sameSite: 'None',
	};

	return res
		.status(200)
		.cookie('accessToken', accessToken, options)
		.cookie('refreshToken', refreshToken, options)
		.json(
			new ApiResponse(
				200,
				{
					user: loggedInUser[0],
					accessToken,
					refreshToken,
				},
				'User logged in successfully'
			)
		);
});

const logoutUser = AsyncHandler(async (req, res) => {
	await User.findByIdAndUpdate(
		req.user._id,
		{
			$unset: {
				refreshToken: 1, // this removes the field from document
			},
		},
		{
			new: true,
		}
	);

	const options = {
		httpOnly: true,
		secure: true,
		sameSite: 'None',
	};

	return res
		.status(200)
		.clearCookie('accessToken', options)
		.clearCookie('refreshToken', options)
		.json(new ApiResponse(200, 'User logged Out', 'success'));
});

const sendEmailOtp = AsyncHandler(async (req, res) => {
	const { email } = req.user;
	if (!email) {
		return res
			.status(500)
			.json(new ApiError(500, 'Failed to get the user email'));
	}
	const genOtp = generateOtp(6);
	const sendEmail = await sendMail(email, genOtp);

	if (sendEmail.success) {
		await User.findByIdAndUpdate(req.user?._id, {
			$set: { verificationOtp: genOtp },
		});
	}

	if (!sendEmail.success) {
		return res
			.status(500)
			.json(new ApiError(500, 'Failed to send OTP to the user'));
	}

	return res.json(
		new ApiResponse(200, `OTP sent to ${email} successfully`, 'success')
	);
});

const verifyOtp = AsyncHandler(async (req, res) => {
	const { otp } = req.body;

	if (!otp) {
		return res
			.status(401)
			.json(
				new ApiError(
					401,
					'Please provide OTP, which is sent to your email address.'
				)
			);
	}

	const user = await User.findById(req.user?._id);

	if (!(user.verificationOtp === otp)) {
		return res
			.status(401)
			.json(new ApiError(401, 'OTP does not match - verification failed!'));
	}

	user.isEmailVerified = true;
	await user.save();

	const loggedInUser = await User.aggregate([
		{
			$match: { _id: new mongoose.Types.ObjectId(user?._id) },
		},
		{
			$lookup: {
				from: 'favorites',
				localField: '_id',
				foreignField: 'owner',
				as: 'userFavorites',
				pipeline: [
					{
						$project: {
							recipies: 1,
						},
					},
				],
			},
		},
		{
			$addFields: {
				userFavorites: { $arrayElemAt: ['$userFavorites', 0] },
			},
		},
		{
			$project: {
				password: 0,
				refreshToken: 0,
			},
		},
	]);

	return res
		.status(200)
		.json(new ApiResponse(200, loggedInUser[0], 'Email verified successfully'));
});

const refreshAccessToken = AsyncHandler(async (req, res) => {
	const incomingRefreshToken =
		req.cookies.refreshToken || req.body.refreshToken;

	if (!incomingRefreshToken) {
		return res.status(401).json(new ApiError(401, 'Unauthorized request'));
	}

	try {
		const decodedToken = jwt.verify(
			incomingRefreshToken,
			process.env.REFRESH_TOKEN_SECRET
		);

		const user = await User.findById(decodedToken?._id);

		if (!user) {
			return res.status(401).json(new ApiError(401, 'Invalid refresh token'));
		}

		if (incomingRefreshToken !== user?.refreshToken) {
			return res
				.status(401)
				.json(new ApiError(401, 'Refresh token is expired or used'));
		}

		const options = {
			httpOnly: true,
			secure: true,
			sameSite: 'None',
		};

		const { accessToken, newRefreshToken } =
			await generateAccessAndRefreshToken(user._id);
		return res
			.status(200)
			.cookie('accessToken', accessToken, options)
			.cookie('refreshToken', newRefreshToken, options)
			.json(
				new ApiResponse(
					200,
					{
						accessToken,
						refreshToken: newRefreshToken,
					},
					'Access token refreshed'
				)
			);
	} catch (error) {
		return res
			.status(401)
			.json(new ApiError(401, error?.message || 'Invalid refresh token'));
	}
});

const forgotPasswordLink = AsyncHandler(async (req, res) => {
	const { email } = req.body;
	const user = await User.findOne({ email });

	if (!user) {
		return res.status(404).json(new ApiError(404, 'User not found'));
	}

	// Generate a unique token
	const token = crypto.randomBytes(32).toString('hex');
	const expirationTime =
		Date.now() + parseInt(process.env.RESET_PASSWORD_EXPIRATION);

	// Save token and expiration time in the user's record
	user.resetPasswordToken = token;
	user.resetPasswordExpires = expirationTime;
	await user.save();

	// Construct reset link
	const resetLink = `${process.env.RESET_PASSWORD_BASE_URL}?token=${token}`;

	const sendEmail = await sendForgotPasswordMail(email, resetLink);

	if (!sendEmail.success) {
		return res
			.status(500)
			.json(new ApiError(500, 'Failed to send link via email'));
	}

	return res
		.status(200)
		.json(
			new ApiResponse(200, 'Success', 'Successfully sent reset password link')
		);
});

const resetPassword = AsyncHandler(async (req, res) => {
	const { token, newPassword } = req.body;
	const user = await User.findOne({
		resetPasswordToken: token,
		resetPasswordExpires: { $gt: Date.now() }, // Ensure token has not expired
	});

	if (!user) {
		return res.status(400).json(new ApiError(400, 'Invalid or expired token'));
	}

	// Update password and clear reset token fields
	user.password = newPassword;
	user.resetPasswordToken = undefined;
	user.resetPasswordExpires = undefined;
	await user.save();

	res
		.status(200)
		.json(new ApiResponse(200, 'success', 'Password has been reset'));
});

const changePassword = AsyncHandler(async (req, res) => {
	const { oldPassword, newPassword } = req.body;

	if (!(oldPassword || newPassword)) {
		return res
			.status(401)
			.json(new ApiError(401, 'Please provide old and new passwords'));
	}

	const user = await User.findById(req.user._id);

	const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

	if (!isPasswordCorrect) {
		return res
			.status(401)
			.json(new ApiError(401, 'Old password does not match'));
	}

	user.password = newPassword;
	await user.save({ validateBeforeSave: false });

	return res
		.status(200)
		.json(new ApiResponse(200, {}, 'Password changed successfully'));
});

const getCurrentUser = AsyncHandler(async (req, res) => {
	return res
		.status(200)
		.json(new ApiResponse(200, req.user, 'Current user fetched successfully'));
});

const updateUserDetails = AsyncHandler(async (req, res) => {
	const { username, fullName, email, phone, bio } = req.body;

	if (!username && !fullName && !email && !phone && !bio) {
		return res
			.status(400)
			.json(new ApiError(400, 'Please provide something to update'));
	}

	const user = await User.findById(req.user._id);

	if (username) {
		user.username = username;
	}
	if (fullName !== user.fullName) {
		user.fullName = fullName;
	}
	if (email !== user.email) {
		user.email = email;
		user.isEmailVerified = false;
	}
	if (phone !== user.phone) {
		user.phone = phone;
		user.isPhoneVerified = false;
	}
	if (bio !== user.bio) {
		user.bio = bio;
	}

	await user.save();

	const updatedUser = await User.findById(req.user._id).select(
		'-password -refreshToken'
	);

	return res
		.status(200)
		.json(
			new ApiResponse(200, updatedUser, 'Successfully updated the user details')
		);
});

const updateAvatar = AsyncHandler(async (req, res) => {
	const avatarLocalPath = req.file?.path;

	if (!avatarLocalPath) {
		return res.status(400).json(new ApiError(400, 'Avatar file is missing'));
	}

	const avatar = await uploadAvatarOnCloudinary(avatarLocalPath);

	if (!avatar.url) {
		return res
			.status(501)
			.json(new ApiError(501, 'Error while uploading on cloudinary'));
	}

	//Delete old image from cloudinary
	const oldUser = await User.findById(req.user?._id);
	await deleteAssetOnCloudinary(oldUser.avatarPublicId);

	const user = await User.findByIdAndUpdate(
		req.user?._id,
		{
			$set: {
				avatar: avatar.url,
				avatarPublicId: avatar.public_id,
			},
		},
		{ new: true }
	).select('-password');

	return res
		.status(200)
		.json(new ApiResponse(200, user, 'Avatar Image updated successfully'));
});

const userProfile = AsyncHandler(async (req, res) => {
	// TODO: get user profile which should include -recepies posted -followers -ratings
	const { username } = req.params;
});

const myStats = AsyncHandler(async (req, res) => {
	const currentUserId = req.user._id;

	const user = await User.aggregate([
		{
			$match: { _id: new mongoose.Types.ObjectId(currentUserId) },
		},
		{
			$lookup: {
				from: 'recipes',
				localField: '_id',
				foreignField: 'author',
				as: 'myRecipes',
				pipeline: [
					{
						$lookup: {
							from: 'ratings',
							localField: '_id',
							foreignField: 'recipe',
							as: 'recipeRatings',
						},
					},
					{
						$unwind: {
							path: '$recipeRatings',
							preserveNullAndEmptyArrays: true,
						},
					},
					{
						$group: {
							_id: '$_id',
							averageRating: { $avg: '$recipeRatings.rating' },
							numberOfRatings: { $sum: 1 },
						},
					},
					{
						$project: {
							_id: 1, // Include recipe ID
							averageRating: { $ifNull: ['$averageRating', 0] }, // Handle case where there are no ratings
							numberOfRatings: { $ifNull: ['$numberOfRatings', 0] },
						},
					},
				],
			},
		},
		{
			$lookup: {
				from: 'ratings',
				localField: '_id',
				foreignField: 'owner',
				as: 'ratedRecipes',
				pipeline: [
					{
						$group: {
							_id: '$recipe',
						},
					},
					{
						$group: {
							_id: null,
							numberOfRecipesRated: { $sum: 1 },
						},
					},
					{
						$project: {
							_id: 0,
							numberOfRecipesRated: 1,
						},
					},
				],
			},
		},
		{
			$addFields: {
				recipeCount: { $size: '$myRecipes' },
				averageRating: { $avg: '$myRecipes.averageRating' },
				totalRatings: { $sum: '$myRecipes.numberOfRatings' },
				numberOfRecipesRated: {
					$arrayElemAt: ['$ratedRecipes.numberOfRecipesRated', 0],
				},
			},
		},
		{
			$project: {
				myRecipes: 0,
			},
		},
	]);

	return res
		.status(200)
		.json(new ApiResponse(200, user[0], 'Successfully fetched user stats'));
});

const userRatings = AsyncHandler(async (req, res) => {
	const userId = req.user?._id;

	const ratings = await Rating.aggregate([
		{
			$match: { owner: new mongoose.Types.ObjectId(userId) },
		},
		{
			$project: {
				rating: 1,
				recipe: 1,
			},
		},
	]);

	return res
		.status(200)
		.json(new ApiResponse(200, ratings, 'Successfully fetched user ratings'));
});

const deleteAccount = AsyncHandler(async (req, res) => {
	const { password } = req.body;
	const userId = req.user?._id;

	const user = await User.findById(userId);

	const isPasswordValid = await user.isPasswordCorrect(password);
	if (!isPasswordValid) {
		return res.status(401).json(new ApiError(401, 'password does not match!'));
	}

	await Favorite.deleteOne({
		owner: new mongoose.Types.ObjectId(userId),
	});

	await Rating.deleteMany({
		owner: new mongoose.Types.ObjectId(userId),
	});

	const userRecipes = await Recipe.aggregate([
		{
			$match: { author: new mongoose.Types.ObjectId(userId) },
		},
	]);

	const deleteUserRecipes = async (userRecipes) => {
		if (userRecipes.length > 0) {
			for (let i = 0; i < userRecipes.length; i++) {
				const recipeid = userRecipes[i]._id;

				const recipe = await Recipe.findById(recipeid);

				const deleteImageOnCloudinary = async () => {
					const publicIds = recipe.imagePublicId;

					for (let i = 0; i < publicIds.length; i++) {
						await deleteAssetOnCloudinary(publicIds[i]);
					}
				};
				await deleteImageOnCloudinary();

				await Rating.deleteMany({
					recipe: new mongoose.Types.ObjectId(recipe._id),
				});

				await recipe.deleteOne();
			}
		}
	};

	await deleteUserRecipes(userRecipes);

	await deleteAssetOnCloudinary(user?.avatarPublicId);

	await user.deleteOne();

	const options = {
		httpOnly: true, //by default anybody can modify your cookie from frontend by giving these options cookies can only be modified on the server
		secure: true,
		sameSite: 'None',
	};

	return res
		.status(200)
		.clearCookie('accessToken', options)
		.clearCookie('refreshToken', options)
		.json(
			new ApiResponse(
				200,
				'Account deleted permanently',
				'Account deleted permanently'
			)
		);
});

export {
	registerUser,
	sendEmailOtp,
	login,
	verifyOtp,
	logoutUser,
	refreshAccessToken,
	forgotPasswordLink,
	resetPassword,
	changePassword,
	getCurrentUser,
	updateUserDetails,
	updateAvatar,
	userProfile,
	userRatings,
	myStats,
	deleteAccount,
};
