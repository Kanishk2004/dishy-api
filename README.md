# Recipe Sharing Web Application API

This is the backend API for the Recipe Sharing Web Application, built using Node.js, Express, and MongoDB. The API supports CRUD operations for managing users, recipes, favorites, ratings, and comments. It serves as the foundation for the frontend application, enabling seamless interaction with the database and providing essential functionalities for the recipe-sharing platform.

## Features

- **User Management**: Register, login, logout, update user profiles, and manage user-related data.
- **Recipe Management**: Create, read, update, and delete recipes.
- **Favorites**: Users can mark and manage their favorite recipes.
- **Ratings**: Rate recipes and view average ratings.
- **Comments**: Add and manage comments on recipes.

## Tech Stack

- **Node.js**: JavaScript runtime environment.
- **Express.js**: Web application framework for Node.js.
- **MongoDB**: NoSQL database for storing application data.
- **Mongoose**: ODM for MongoDB, used to manage data relationships and schemas.
- **Other Dependencies**:
  - `dotenv`: For environment variable management.
  - `bcrypt`: For password hashing.
  - `jsonwebtoken`: For token-based authentication.
  - `multer`: For handling file uploads (e.g., recipe images).
  - `cors`: To handle cross-origin requests.
  - `jsonwebtoken`: To securely authenticate and authorize.
  - `mongoose`: To interact with MongoDB database.

## Getting Started

### Prerequisites

- Node.js and npm installed on your machine.
- MongoDB instance running locally or on a cloud service (e.g., MongoDB Atlas).

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Kanishk2004/dishy-api.git
   cd dishy-api
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   Create a `.env` file in the root directory and add the following:

   ```env
   PORT=8080
   MONGO_URI=your_mongodb_uri
   CORS_ORIGIN=your_frontend_url

   ACCESS_TOKEN_SECRET=your_secret_key
   ACCESS_TOKEN_EXPIRY=1d
   REFRESH_TOKEN_SECRET=your_secret_key
   REFRESH_TOKEN_EXPIRY=10d

   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   MAILTRAP_HOST=
   MAILTRAP_PORT=
   MAILTRAP_USERNAME=
   MAILTRAP_PASS=
   SENDER_EMAIL=

   RESET_PASSWORD_EXPIRATION=3600000
   RESET_PASSWORD_BASE_URL=http://localhost:8080/users/forgot-password

   ```

4. Start the application:

   ```bash
   npm start
   ```

   The API will run on `http://localhost:8080`.

### API Endpoints

#### Users

- `POST /api/v1/users/register` - Register a new user.
- `POST /api/v1/users/login` - Log in a user.
- `POST /api/v1/users/logout` - Log out in a user.
- `POST /api/v1/users/refresh-token` - Refresh an access token.
- `POST /api/v1/users/verify-email` - Send otp to verify email.
- `PATCH /api/v1/users/verify-email` - Authenticate the OTP sent on email.
- `POST /api/v1/users/forgot-password` - Sent forgot password OTP.
- `PATCH /api/v1/users/forgot-password` - Authenticates the OTP.
- `POST /api/v1/users/change-password` - Changes the password.
- `GET /api/v1/users/me` - Get the authenticated user's profile.
- `PATCH /api/v1/users/update-account` - Update the authenticated user's profile.
- `PATCH /api/v1/users/avatar` - Update the user avatar.
- `GET /api/v1/users/u/:username` - Get the user profile.

#### Recipes

- `GET /api/recipes` - Get all recipes.
- `POST /api/recipes` - Create a new recipe.
- `GET /api/recipes/:id` - Get a specific recipe by ID.
- `PUT /api/recipes/:id` - Update a recipe by ID.
- `DELETE /api/recipes/:id` - Delete a recipe by ID.

#### Favorites

- `GET /api/favorites` - Get all favorite recipes of the authenticated user.
- `POST /api/favorites/toggle/:recipeId` - Add or remove a recipe from favorites.

#### Ratings

- `POST /api/ratings/:recipeId` - Rate a recipe.
- `GET /api/ratings/avg/:recipeId` - Get the average rating of a recipe.

#### Comments

- `POST /api/comments/:recipeId` - Add a comment to a recipe.
- `GET /api/comments/:recipeId` - Get all comments for a recipe.
- `DELETE /api/comments/:commentId` - Delete a comment by ID.

### Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

