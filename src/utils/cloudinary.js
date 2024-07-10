import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config({
	path: "./.env",
});

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadAvatarOnCloudinary = async (localFilePath) => {
	try {
		if (!localFilePath) return null;

		const response = await cloudinary.uploader.upload(localFilePath, {
			folder: "dishy/avatar",
			resource_type: "auto",
			transformation: [
				{
					quality: "auto",
				},
			],
		});

		fs.unlinkSync(localFilePath);
		// console.log(response)
		return response;
	} catch (error) {
		console.log(error);
		fs.unlinkSync(localFilePath);
	}
};

const uploadPicturesOnCloudinary = async (localFilePath) => {
	try {
		if (!localFilePath) return null;

		const response = cloudinary.uploader.upload(localFilePath, {
			folder: "dishy/pictures",
			resource_type: "auto",
			transformation: [
				{
					quality: "auto",
				},
			],
		});

		fs.unlinkSync(localFilePath);
		return response;
	} catch (error) {
		console.log(error);
		fs.unlinkSync(localFilePath);
	}
};

const deleteAssetOnCloudinary = async (cloudinaryPublicId) => {
	try {
		if (!cloudinaryPublicId) return null;

		//delete the file
		const response = await cloudinary.uploader.destroy(cloudinaryPublicId, {
			resource_type: "image",
		});

		return response;
	} catch (error) {
		console.log(error);
	}
};

export { uploadAvatarOnCloudinary, uploadPicturesOnCloudinary, deleteAssetOnCloudinary };
