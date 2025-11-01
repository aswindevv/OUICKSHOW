import { clerkClient } from "@clerk/express";
import Booking from "../models/Booking.js";
import Movie from "../models/Movie.js";

// API Controller Function to Get User Bookings
export const getUserBookings = async (req, res) => {
    try {
        // Retrieve the authenticated user's ID
        const userId = req.auth().userId;

        // Find bookings associated with the userId
        const bookings = await Booking.find({ user: userId })
            // Nested population: populate show details, and populate the 'movie' field within the 'show' document
            .populate({
                path: "show",
                populate: { path: "movie" }
            })
            // Sort by creation date descending (most recent first)
            .sort({ createdAt: -1 });

        res.json({ success: true, bookings });
    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: error.message });
    }
};

// API Controller Function to update Favorite Movie in Clerk User Metadata
export const updateFavorite = async (req, res) => {
    try {
        const { movieId } = req.body;
        const userId = req.auth().userId;

        // Fetch the current user object from Clerk
        const user = await clerkClient.users.getUser(userId);

        // Ensure 'favorites' array exists
        if (!user.privateMetadata.favorites) {
            user.privateMetadata.favorites = [];
        }

        // Toggle favorite
        if (!user.privateMetadata.favorites.includes(movieId)) {
            user.privateMetadata.favorites.push(movieId);
        } else {
            user.privateMetadata.favorites = user.privateMetadata.favorites.filter(
                (item) => item !== movieId
            );
        }

        // Update the user's private metadata in Clerk
        await clerkClient.users.updateUserMetadata(userId, {
            privateMetadata: user.privateMetadata
        });

        res.json({ success: true, message: "Favorite updated successfully." });
    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: error.message });
    }
};

// API Controller Function to Get Favorite Movies
export const getFavorites = async (req, res) => {
    try {
        const userId = req.auth().userId;
        const user = await clerkClient.users.getUser(userId);

        const favorites = user.privateMetadata.favorites || [];

        const movies = await Movie.find({ _id: { $in: favorites } });

        res.json({ success: true, movies });
    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: error.message });
    }
};
