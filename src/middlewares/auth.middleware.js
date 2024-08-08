import { User } from '../models/user.models.js';
import { ApiError } from '../utils/ApiError.js';
import { AsyncHandler } from '../utils/AsyncHandler.js';
import jwt from 'jsonwebtoken';

export const verifyJWT = AsyncHandler(async (req, res, next) => {
	try {
		const token =
			req.cookies?.accessToken ||
			req.header('Authorization')?.replace('Bearer ', '');

		if (!token) {
			return res.status(401).json(new ApiError(401, 'Unauthorized request'));
		}

		const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

		const user = await User.findById(decodedToken?._id).select(
			'-password -refreshToken'
		);

		if (!user) {
			return res.status(401).json(new ApiError(401, 'Invalid access token'));
		}

		req.user = user;
		next();
	} catch (error) {
		return res.status(401).json(new ApiError(401, 'Invalid access token'));
	}
});
