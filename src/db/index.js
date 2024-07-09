import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDb = async () => {
	try {
		const db = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
		console.log(`\nMongoDB connected! \nDB host: ${db.connection.host}`);
	} catch (error) {
		console.log(`MongoDB connection error!`, error);
		process.exit(1);
	}
};

export default connectDb;
