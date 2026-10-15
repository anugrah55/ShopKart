import express from "express";
import {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist
} from "../controllers/wishlist.controller.js";
import isAuthenticated from "../middlewares/auth.middleware.js";

const wishlistRoutes = express.Router();

// Every wishlist route is protected
wishlistRoutes.use(isAuthenticated);

wishlistRoutes.get("/", getWishlist);
wishlistRoutes.post("/:productId", addToWishlist);
wishlistRoutes.delete("/:productId", removeFromWishlist);
wishlistRoutes.patch("/:productId/toggle", toggleWishlist);

export default wishlistRoutes;
