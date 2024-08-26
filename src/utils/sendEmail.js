import crypto from 'crypto';
import nodemailer from 'nodemailer';

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
		.toString('hex') // Convert to hexadecimal format
		.slice(0, length)
		.toUpperCase(); // Return the required number of characters
	return otp;
};

export const sendMail = async (recieverEmail, otp) => {
	try {
		const info = await transporter.sendMail({
			from: process.env.SENDER_EMAIL, // sender address
			to: recieverEmail, // list of receivers
			subject: 'Email verification - Dishy', // Subject line
			text: `Your OTP code: ${otp}`, // plain text body
			html: `<h3>Your OTP code is: </h3><h1>${otp}</h1>`, // html body
		});

		console.log('Email sent: %s', info.messageId);
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

export const sendForgotPasswordMail = async (recieverEmail, resetLink) => {
	try {
		const info = await transporter.sendMail({
			from: process.env.SENDER_EMAIL, // sender address
			to: recieverEmail, // list of receivers
			subject: 'Password Reset - Dishy', // Subject line
			text: `You requested a password reset. Click the link to reset your password: ${resetLink}`, // plain text body
			html: `<p>You requested a password reset. Click the link to reset your password:</p><a href="${resetLink}">Reset Password</a> <p>or paste this link in your browser \n ${resetLink}</p>`, // html body
		});

		console.log('Email sent: %s', info.messageId);
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
