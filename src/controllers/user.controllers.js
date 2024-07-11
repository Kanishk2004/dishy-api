import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { uploadAvatarOnCloudinary } from "../utils/cloudinary.js";
import { generateOtp, sendMail } from "../utils/sendGridMail.js";

const generateAccessAndRefreshToken = async (userId) => {
	try {
		const user = await User.findById(userId);
		const accessToken = user.generateAccessToken();
		const refreshToken = user.generateRefreshToken();

		user.refreshToken = refreshToken;
		await user.save({ validateBeforeSave: false });
		return { accessToken, refreshToken };
	} catch (error) {
		throw new ApiError(500, "Something went wrong while generating access and refresh token");
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
		throw new ApiError(400, "All fields are required");
	}

	const existedUser = await User.findOne({
		$or: [{ username }, { email }],
	});

	if (existedUser) {
		// console.log(existedUser);
		throw new ApiError(400, "User with email or username already exists");
	}

	let avatarLocalPath = req.file?.path;

	if (!avatarLocalPath) {
		throw new ApiError(400, "Avatar is required");
		// avatarLocalPath = "./public/noavatar.png";
	}

	const avatar = await uploadAvatarOnCloudinary(avatarLocalPath);

	if (!avatar) {
		throw new ApiError(400, "Avatar cloudinary upload failed!");
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
		bio: "update your bio",
	});

	const newUser = await User.findById(user._id).select("-password -refreshToken");

	if (!newUser) {
		throw new ApiError(500, "Failed to register the user");
	}

	return res.status(200).json(new ApiResponse(200, newUser, "Successfully registered the new user"));
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
		throw new ApiError(400, "username or email is required");
	}

	const user = await User.findOne({
		$or: [{ username }, { email }],
	});

	if (!user) {
		throw new ApiError(404, "user doesn't exists!");
	}

	// using "user" instead of "User" because User methods like (User.findOne) is available through mongoose but the methods we created in user model file is accessed by using "user"
	const isPasswordValid = await user.isPasswordCorrect(password);
	if (!isPasswordValid) {
		throw new ApiError(401, "Invalid user credentials");
	}
	const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

	const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

	const options = {
		httpOnly: true, //by default anybody can modify your cookie from frontend by giving these options cookies can only be modified on the server
		secure: true,
	};

	return res
		.status(200)
		.cookie("accessToken", accessToken, options)
		.cookie("refreshToken", refreshToken, options)
		.json(
			new ApiResponse(
				200,
				{
					user: loggedInUser,
					accessToken,
					refreshToken,
				},
				"User logged in successfully"
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
	};

	return res
		.status(200)
		.clearCookie("accessToken", options)
		.clearCookie("refreshToken", options)
		.json(new ApiResponse(200, "User logged Out", "success"));
});

const genOtp = generateOtp(6);

const sendEmailOtp = AsyncHandler(async (req, res) => {
	const { email } = req.user;
	console.log(genOtp, email);
	// sendMail(email, genOtp);

	return res.json(new ApiResponse(200, `OTP: ${genOtp} sent to ${email} successfully`, "success"));
});

const verifyOtp = AsyncHandler(async (req, res) => {
	const { otp } = req.body;
	if (genOtp === otp) {
		console.log("otp matched successfully");
		// await User.findByIdAndUpdate(req.user?._id, {

		// })
	}
	console.log(genOtp, otp);
	return res.json({ success: "success" });
});

export { registerUser, sendEmailOtp, login, verifyOtp, logoutUser };
