import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
// Assuming User model is imported for countDocuments
// import User from "../models/User.js";

// API to check if user is admin
export const isAdmin = async (req, res) => {
    res.json({success: true, isAdmin: true});
}

// API to get dashboard data
export const getDashboardData = async (req, res) => {
    try {
        // 1. Get all successfully paid bookings
        const bookings = await Booking.find({isPaid: true});

        // 2. Get all upcoming shows
        const activeShows = await Show.find({showDateTime: {$gte: new Date()}}).populate('movie');

        // 3. Get total number of users
        const totalUser = await User.countDocuments(); // Assuming User model is available

        // 4. Compile dashboard data object
        const dashboardData = {
            totalBookings: bookings.length,
            // Calculate total revenue from paid bookings
            totalRevenue: bookings.reduce((acc, booking) => acc + booking.amount, 0),
            activeShows,
            totalUser
        };

        res.json({success: true, dashboardData});

    } catch (error) {
        console.error(error);
        res.json({success: false, message: error.message});
    }
}

// API to get all shows
export const getAllShows = async (req, res) => {
    try {
        const shows = await Show.find({showDateTime: {$gte: new Date()}}).populate('movie').sort({showDateTime: 1});
        res.json({success: true, shows});
    } catch (error) {
        console.error(error);
        res.json({success: false, message: error.message});
    }
}


// API to get all bookings
export const getAllBookings = async (req, res) => {
    try {
        // Fetch all bookings
        const bookings = await Booking.find({})
            // Populate user details
            .populate('user')
            // Nested population: populate show details, and populate the 'movie' field within the 'show' document
            .populate({
                path: 'show',
                populate: { path: 'movie' }
            })
            // Sort by creation date descending (most recent first)
            .sort({createdAt: -1}); 
            
        res.json({success: true, bookings});
    } catch (error) {
        console.error(error);
        res.json({success: false, message: error.message});
    }
}