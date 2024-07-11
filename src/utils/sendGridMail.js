import sgMail from "@sendgrid/mail";
import crypto from "crypto";

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
	sgMail.setApiKey(process.env.SENDGRID_API_KEY);
	const msg = {
		to: recieverEmail, // Change to your recipient
		from: process.env.SENDGRID_SENDER_EMAIL, // Change to your verified sender
		subject: "Dishy - Email verification",
		text: `Your OTP code: ${otp}`,
		html: `<h3>Your OTP code is: </h3><h1>${otp}</h1>`,
	};
	await sgMail
		.send(msg)
		.then(() => {
			console.log("Email sent");
		})
		.catch((error) => {
			console.error(error);
		});
};
