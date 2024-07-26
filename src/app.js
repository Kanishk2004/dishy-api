import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

// using cors as the middleware to restrict the unknown URLs to access our database
app.use(
	cors({
		origin: process.env.CORS_ORIGIN, // origin url to access database - currently allowed from all urls
		credentials: true,
	})
);

// common middlewares
app.use(express.json({ limit: '16kb' })); // to limit the data comming in json form
app.use(express.urlencoded({ extended: true, limit: '16kb' })); // limiting the data comming through url
app.use(express.static('public')); // all the images and other assets will be put in public folder outside src dir
app.use(cookieParser());

// import routes
import healthCheckRouter from './routes/healthcheck.routes.js';
import userRouter from './routes/user.routes.js';
import recipeRouter from './routes/recipe.routes.js';
import commentRouter from './routes/comment.routes.js';

// routes
app.use('/api/v1/healthcheck', healthCheckRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/recipies', recipeRouter);
app.use('/api/v1/comments', commentRouter);

export { app };
