import express from "express";
import { protectAdmin } from "../middleware/auth.js";

import { getAllBookings, getAllShows, getDashboardData, isAdmin } from "../controllers/adminController.js";

const adminRouter = express.Router();

// Route to check admin status
adminRouter.get('/is-admin', protectAdmin, isAdmin);

// Route to get dashboard summary data
adminRouter.get('/dashboard', protectAdmin, getDashboardData);

// Route to get a list of all upcoming shows
adminRouter.get('/all-shows', protectAdmin, getAllShows);

// Route to get a list of all bookings
adminRouter.get('/all-bookings', protectAdmin, getAllBookings);

export default adminRouter;