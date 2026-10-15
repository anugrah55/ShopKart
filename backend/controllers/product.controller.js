import mongoose from "mongoose";
import Product from "../models/product.model.js";

// Escape regex special characters so user search text is matched literally
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const sortOptions = {
    price_asc: { price: 1 },
    price_desc: { price: -1 }
};

export const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, image, stock } = req.body || {};

        if (!name || !description || price === undefined || !category || !image || stock === undefined) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        if (typeof price !== "number" || price <= 0) {
            return res.status(400).json({ success: false, message: "Price must be a number greater than 0" });
        }

        if (typeof stock !== "number" || stock < 0) {
            return res.status(400).json({ success: false, message: "Stock must be a number and cannot be negative" });
        }

        const product = await Product.create({ name, description, price, category, image, stock });

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            product
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({ success: false, message: error.message });
        }
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getProducts = async (req, res) => {
    try {
        const { search, category, sort } = req.query;

        // Build the MongoDB filter dynamically from whichever query params are present
        const filter = {};
        if (search) {
            filter.name = { $regex: escapeRegex(search), $options: "i" };
        }
        if (category) {
            filter.category = category;
        }

        const products = await Product.find(filter)
            .select("name price category image stock")
            .sort(sortOptions[sort] || { createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        return res.status(200).json({ success: true, product });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
