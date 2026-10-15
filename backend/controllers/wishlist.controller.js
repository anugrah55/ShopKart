import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

// req.user is set by the auth middleware, so the user always comes from the JWT, never the client
const isInWishlist = (user, productId) => user.wishlist.some((id) => id.equals(productId));

export const getWishlist = async (req, res) => {
    try {
        const customer = await Customer.findById(req.user._id).populate({
            path: "wishlist",
            select: "name price category image stock"
        });

        return res.status(200).json({
            success: true,
            count: customer.wishlist.length,
            wishlist: customer.wishlist
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        if (isInWishlist(req.user, productId)) {
            return res.status(409).json({ success: false, message: "Product already in wishlist" });
        }

        // $addToSet only adds the id if it is not already present, so duplicates are impossible
        await Customer.updateOne({ _id: req.user._id }, { $addToSet: { wishlist: productId } });

        return res.status(201).json({ success: true, message: "Product added to wishlist" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }

        if (!isInWishlist(req.user, productId)) {
            return res.status(404).json({ success: false, message: "Product not in wishlist" });
        }

        await Customer.updateOne({ _id: req.user._id }, { $pull: { wishlist: productId } });

        return res.status(200).json({ success: true, message: "Product removed from wishlist" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const toggleWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }

        if (isInWishlist(req.user, productId)) {
            await Customer.updateOne({ _id: req.user._id }, { $pull: { wishlist: productId } });
            return res.status(200).json({ success: true, saved: false, message: "Product removed from wishlist" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        await Customer.updateOne({ _id: req.user._id }, { $addToSet: { wishlist: productId } });
        return res.status(200).json({ success: true, saved: true, message: "Product added to wishlist" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
