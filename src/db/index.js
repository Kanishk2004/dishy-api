import mongoose from "mongoose";

const connectDb = async () => {
	try {
		const db = await mongoose.connect(`${process.env.MONGODB_URI}`);
		console.log(`MongoDB connected! \nDB host: ${db.connection.host}`);
	} catch (error) {
		console.log(`MongoDB connection error!`, error);
		process.exit(1);
	}
};

export default connectDb;
