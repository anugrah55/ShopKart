import Razorpay from "razorpay";

let razorpay = null;

// Created on first use (not at import time) so dotenv has already loaded the keys.
// Returns null when keys are missing so the API can respond with a clear error.
const getRazorpay = () => {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        return null;
    }

    if (!razorpay) {
        razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
    }

    return razorpay;
};

export default getRazorpay;
