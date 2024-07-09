import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const healthCheck = AsyncHandler(async (req, res) => {
	return res.status(200).json(new ApiResponse(200, "OK", "Health check passed!"));
});

export { healthCheck };
