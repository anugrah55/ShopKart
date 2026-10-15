import crypto from "crypto";
import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";
import Order, { ORDER_STATUSES } from "../models/order.model.js";
import getRazorpay from "../config/razorpay.js";

const ADDRESS_FIELDS = ["fullName", "phone", "addressLine1", "city", "state", "pincode"];

// Returns { error } or { address } with every field trimmed
const validateShippingAddress = (shippingAddress) => {
    if (!shippingAddress || typeof shippingAddress !== "object") {
        return { error: "Shipping address is required" };
    }

    const address = {};
    for (const field of ADDRESS_FIELDS) {
        const value = shippingAddress[field];
        // Whitespace-only input counts as empty
        if (typeof value !== "string" || value.trim() === "") {
            return { error: `${field} is required` };
        }
        address[field] = value.trim();
    }

    if (!/^[6-9]\d{9}$/.test(address.phone)) {
        return { error: "Phone must be a valid 10-digit mobile number" };
    }

    if (!/^\d{6}$/.test(address.pincode)) {
        return { error: "Pincode must contain 6 digits" };
    }

    return { address };
};

export const createPaymentOrder = async (req, res) => {
    try {
        // Only the shipping address is read from the body; any totalAmount/prices sent by the client are ignored
        const { error, address } = validateShippingAddress(req.body?.shippingAddress);
        if (error) {
            return res.status(400).json({ success: false, message: error });
        }

        const razorpay = getRazorpay();
        if (!razorpay) {
            return res.status(500).json({ success: false, message: "Payment gateway is not configured" });
        }

        const customer = await Customer.findById(req.user._id);
        if (customer.cart.length === 0) {
            return res.status(400).json({ success: false, message: "Your cart is empty" });
        }

        // Load the latest product data for every cart item
        const productIds = customer.cart.map((item) => item.product);
        const products = await Product.find({ _id: { $in: productIds } });

        const items = [];
        let totalAmount = 0;

        for (const cartItem of customer.cart) {
            const product = products.find((p) => p._id.equals(cartItem.product));

            if (!product) {
                return res.status(400).json({
                    success: false,
                    message: "A product in your cart is no longer available. Please remove it and try again."
                });
            }

            if (cartItem.quantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}. Only ${product.stock} left.`
                });
            }

            // Snapshot purchase-time product details into the order
            items.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity: cartItem.quantity,
                image: product.image
            });

            // Total is always calculated on the server from the latest prices
            totalAmount += product.price * cartItem.quantity;
        }

        const order = await Order.create({
            user: req.user._id,
            items,
            shippingAddress: address,
            totalAmount
        });

        let razorpayOrder;
        try {
            razorpayOrder = await razorpay.orders.create({
                amount: Math.round(totalAmount * 100), // Razorpay expects paise
                currency: "INR",
                receipt: order._id.toString()
            });
        } catch (razorpayError) {
            console.log(razorpayError);
            order.paymentStatus = "FAILED";
            await order.save();
            return res.status(502).json({ success: false, message: "Unable to start payment. Please try again." });
        }

        order.razorpayOrderId = razorpayOrder.id;
        await order.save();

        // The cart is NOT cleared here - only after the payment is verified
        return res.status(201).json({
            success: true,
            shopKartOrderId: order._id,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key: process.env.RAZORPAY_KEY_ID // Key ID is public; the Key Secret never leaves the server
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const { shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};

        if (!shopKartOrderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ success: false, message: "Missing payment details" });
        }

        if (!mongoose.isValidObjectId(shopKartOrderId)) {
            return res.status(400).json({ success: false, message: "Invalid order ID" });
        }

        // Only the logged-in user's own order can be verified
        const order = await Order.findOne({ _id: shopKartOrderId, user: req.user._id });
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // Use the Razorpay order id stored in our DB as the trusted value, not the one from the browser
        if (!order.razorpayOrderId || order.razorpayOrderId !== razorpay_order_id) {
            return res.status(400).json({ success: false, message: "Payment does not belong to this order" });
        }

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(order.razorpayOrderId + "|" + razorpay_payment_id)
            .digest("hex");

        const expected = Buffer.from(expectedSignature);
        const received = Buffer.from(String(razorpay_signature));
        const signatureValid = expected.length === received.length && crypto.timingSafeEqual(expected, received);

        if (!signatureValid) {
            // Order stays PENDING and the cart is untouched
            return res.status(400).json({ success: false, message: "Invalid payment signature" });
        }

        // Signature is valid. Mark PAID only if it isn't already, in one atomic update,
        // so a repeated verify call can't reduce stock or clear the cart twice.
        const paidOrder = await Order.findOneAndUpdate(
            { _id: order._id, paymentStatus: { $ne: "PAID" } },
            { paymentStatus: "PAID", status: "PLACED", razorpayPaymentId: razorpay_payment_id },
            { returnDocument: "after" }
        );

        if (!paidOrder) {
            const existing = await Order.findById(order._id);
            return res.status(200).json({ success: true, message: "Payment already verified", order: existing });
        }

        // Reduce stock for each purchased item
        for (const item of paidOrder.items) {
            await Product.updateOne(
                { _id: item.product, stock: { $gte: item.quantity } },
                { $inc: { stock: -item.quantity } }
            );
        }

        // Clear the cart only now that payment is verified
        await Customer.updateOne({ _id: req.user._id }, { $set: { cart: [] } });

        return res.status(200).json({ success: true, message: "Payment verified, order placed", order: paidOrder });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getOrders = async (req, res) => {
    try {
        // Only this user's paid orders; abandoned/unpaid checkouts are not shown as orders
        const orders = await Order.find({ user: req.user._id, paymentStatus: "PAID" }).sort({ createdAt: -1 });

        return res.status(200).json({ success: true, count: orders.length, orders });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: "Invalid order ID" });
        }

        // Filtering by user means someone else's order looks exactly like a missing one (404)
        const order = await Order.findOne({ _id: id, user: req.user._id });
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        return res.status(200).json({ success: true, order });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Bonus: development-only endpoint to move an order forward (PLACED -> CONFIRMED -> SHIPPED -> DELIVERED)
export const updateOrderStatus = async (req, res) => {
    try {
        if (process.env.NODE_ENV === "production") {
            return res.status(403).json({ success: false, message: "Not available in production" });
        }

        const { id } = req.params;
        const { status } = req.body || {};

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: "Invalid order ID" });
        }

        const order = await Order.findOne({ _id: id, user: req.user._id });
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        if (order.paymentStatus !== "PAID") {
            return res.status(400).json({ success: false, message: "Only paid orders can be updated" });
        }

        // Status can only move forward
        if (ORDER_STATUSES.indexOf(status) <= ORDER_STATUSES.indexOf(order.status)) {
            return res.status(400).json({ success: false, message: `Cannot change status from ${order.status} to ${status}` });
        }

        order.status = status;
        await order.save();

        return res.status(200).json({ success: true, message: "Order status updated", order });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
