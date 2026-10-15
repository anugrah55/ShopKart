import bcrypt from "bcrypt";
import Customer from "../models/customer.model.js";
import genToken from "../utils/generateToken.js";

const cookieOptions = {
    httpOnly: true
};

export const registerCustomer = async (req, res) => {
    try {
        const { fullName, password, phone } = req.body || {};
        // Normalise so John@gmail.com and john@gmail.com are the same account
        const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";

        if (!fullName || !email || !password || !phone) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        const customerEmailExists = await Customer.findOne({ email });
        if (customerEmailExists) {
            return res.status(409).json({ message: "Email already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newCustomer = await Customer.create({
            fullName,
            email,
            password: hashedPassword,
            phone
        });

        return res.status(201).json({
            success: true,
            message: "Customer registered successfully",
            customer: {
                _id: newCustomer._id,
                fullName: newCustomer.fullName,
                email: newCustomer.email,
                phone: newCustomer.phone
            }
        });
    } catch (error) {
        // Unique index caught a duplicate that slipped past the findOne check (two requests at once)
        if (error.code === 11000) {
            return res.status(409).json({ message: "Email already exists" });
        }
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const loginCustomer = async (req, res) => {
    try {
        const { password } = req.body || {};
        const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const customerExists = await Customer.findOne({ email });
        if (!customerExists) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const correctPassword = await bcrypt.compare(password, customerExists.password);
        if (!correctPassword) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = genToken(customerExists._id);

        res.cookie("token", token, cookieOptions);

        return res.status(200).json({
            success: true,
            message: "Login successful"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getProfile = async (req, res) => {
    try {
        return res.status(200).json(req.user);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const logoutCustomer = async (req, res) => {
    try {
        res.clearCookie("token", cookieOptions);

        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
