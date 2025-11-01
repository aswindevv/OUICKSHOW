import Show from "../models/Show.js";
import Booking from "../models/Booking.js";
import Stripe from "stripe";
// Assuming Booking model is also imported here
// import Booking from "../models/Booking.js";



// Function to check availability of selected seats for a movie
const checkSeatsAvailability = async (showId, selectedSeats) => {
    try {
        const showData = await Show.findById(showId);
        
        // Safety check: if show doesn't exist, treat it as unavailable
        if (!showData) return false; 

        const occupiedSeats = showData.occupiedSeats;

        // Check if ANY of the selected seats exist as a key in occupiedSeats
        const isAnySeatTaken = selectedSeats.some(seat => occupiedSeats[seat]); 

        // Return the opposite: true if available (no seat taken), false if unavailable (at least one seat taken)
        return !isAnySeatTaken; 
    } catch (error) {
        console.log(error.message);
        return false;
    }
};

export const createBooking = async (req, res) => {
    try {
        // NOTE: req.auth() and req.body structure are inferred from usage
        const userId = req.auth(); 
        const { showId, selectedSeats } = req.body;
        // const origin = req.headers; // This line seems unused in the rest of the visible code

        // Check if the seat is available for the selected show
        const isAvailable = await checkSeatsAvailability(showId, selectedSeats);

        if (!isAvailable) {
            return res.json({ success: false, message: "Selected Seats are not available." });
        }

        // Get the show details
        const showData = await Show.findById(showId).populate('movie');

        // Create a new booking
        const booking = await Booking.create({
            user: userId,
            show: showId,
            // Calculate amount: Show Price * Number of seats
            amount: showData.showPrice * selectedSeats.length, 
            bookedSeats: selectedSeats
        });

        // Update occupied seats in the Show document
        selectedSeats.map((seat) => {
            // Assign the user ID to the selected seat key
            showData.occupiedSeats[seat] = userId; 
        });

        // Mark the object as modified for Mongoose, necessary if the field type is not an array (which `occupiedSeats` appears to be)
        showData.markModified('occupiedSeats'); 
        await showData.save();

        // // Stripe Payment Gateway Initialize (Commented out in visible code but indicated)
        const stripInstance = new Stripe(process.env.STRIPE_SECRET_KEY)
        const line_items =[{
            price_data:{
                currency:'AUD',
                product_data:{
                    name:showData.movie.title
                },
                unit_amount:Math.floor(booking.amount)*100
            },
            quantity:1
        }]

        const session =await stripInstance.checkout.sessions.create({
            success_url:`${origin}/loading/my-bookings`,
            cancel_url:`${origin}/my-bookings`,
            line_items:line_items,
            mode:'payment',
            metadata:{
                bookingId:booking._id.toString()

            },
            expires_at:Math.floor(Date.now()/1000)+30*60,


        })

        booking.paymentLink=session.url
        await booking.save()



        res.json({ success: true, url:session.url});

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

export const getOccupiedSeats = async (req, res) => {
    try {
        const { showId } = req.params;
        
        const showData = await Show.findById(showId);

        // Extracting keys (seat numbers) from the occupiedSeats object
        const occupiedSeats = Object.keys(showData.occupiedSeats); 

        res.json({ success: true, occupiedSeats });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}