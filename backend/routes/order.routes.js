import express from "express";
import {
    createPaymentOrder,
    verifyPayment,
    getOrders,
    getOrderById,
    updateOrderStatus
} from "../controllers/order.controller.js";
import isAuthenticated from "../middlewares/auth.middleware.js";

const orderRoutes = express.Router();

// Every order route is protected
orderRoutes.use(isAuthenticated);

orderRoutes.post("/create-payment-order", createPaymentOrder);
orderRoutes.post("/", createPaymentOrder); // alias used in the lab's Postman test plan
orderRoutes.post("/verify-payment", verifyPayment);
orderRoutes.get("/", getOrders);
orderRoutes.get("/:id", getOrderById);
orderRoutes.patch("/:id/status", updateOrderStatus); // bonus, dev only

export default orderRoutes;
