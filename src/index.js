import { app } from "./app.js";
import dotenv from "dotenv";
import connectDb from "./db/index.js";

dotenv.config({
	path: "./.env",
});

const port = process.env.PORT || 7000;

connectDb()
	.then(
		app.listen(port, () => {
			console.log(`Server is running on ${port}...`);
		})
	)
	.catch((err) => {
		console.log(`MongoDB connection error!`, err);
	});
