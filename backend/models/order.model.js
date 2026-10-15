import mongoose from "mongoose";

export const ORDER_STATUSES = ["PENDING_PAYMENT", "PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: true
        },

        // Snapshot of what was bought: name/price are copied so later Product changes don't alter old orders
        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true
                },
                name: {
                    type: String,
                    required: true
                },
                price: {
                    type: Number,
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1
                },
                image: {
                    type: String
                }
            }
        ],

        shippingAddress: {
            fullName: { type: String, required: true },
            phone: { type: String, required: true },
            addressLine1: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            pincode: { type: String, required: true }
        },

        totalAmount: {
            type: Number,
            required: true
        },

        paymentStatus: {
            type: String,
            enum: ["PENDING", "PAID", "FAILED"],
            default: "PENDING"
        },

        status: {
            type: String,
            enum: ORDER_STATUSES,
            default: "PENDING_PAYMENT"
        },

        razorpayOrderId: String,
        razorpayPaymentId: String
    },
    { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
