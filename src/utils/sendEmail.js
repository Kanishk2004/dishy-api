import crypto from "crypto";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
	host: process.env.MAILTRAP_HOST,
	port: process.env.MAILTRAP_PORT,
	secure: false, // Use `true` for port 465, `false` for all other ports
	auth: {
		user: process.env.MAILTRAP_USERNAME,
		pass: process.env.MAILTRAP_PASS,
	},
});

export const generateOtp = (length) => {
	const otp = crypto
		.randomBytes(Math.ceil(length / 2))
		.toString("hex") // Convert to hexadecimal format
		.slice(0, length)
		.toUpperCase(); // Return the required number of characters
	// console.log(otp);
	return otp;
};

export const sendMail = async (recieverEmail, otp) => {
	try {
		const info = await transporter.sendMail({
			from: process.env.SENDER_EMAIL, // sender address
			to: recieverEmail, // list of receivers
			subject: "Dishy - Email verification", // Subject line
			text: `Your OTP code: ${otp}`, // plain text body
			html: `<h3>Your OTP code is: </h3><h1>${otp}</h1>`, // html body
		});

		console.log("Email sent: %s", info.messageId);
		return {
			success: true,
		};
	} catch (error) {
		console.log(error);
		return {
			success: false,
		};
	}
};
