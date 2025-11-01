import express from "express";
import { getFavorites, getUserBookings, updateFavorite } from "../controllers/userController.js";

const userRouter = express.Router();

// Route to get a user's booking history
userRouter.get('/bookings', getUserBookings);

// Route to add or remove a movie from the user's favorites list
userRouter.post('/update-favorite', updateFavorite);

// Route to get the user's favorite movies list (full details)
userRouter.get('/favorites', getFavorites);

export default userRouter;