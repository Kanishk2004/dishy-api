import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { uploadAvatarOnCloudinary } from "../utils/cloudinary.js";

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
		console.log(existedUser);
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

export { registerUser };
