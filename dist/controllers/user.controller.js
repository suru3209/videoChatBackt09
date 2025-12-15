"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getCurrentUser = exports.checkUsername = exports.getMeetingHistory = exports.addMeetingHistory = exports.login = exports.signup = void 0;
const user_model_1 = require("../models/user.model");
const meeting_model_1 = require("../models/meeting.model");
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const http_status_1 = __importDefault(require("http-status"));
/* ======================================================
   SIGNUP
====================================================== */
const signup = async (req, res) => {
    const { name, username, email, password } = req.body;
    if (!username || !name || !email || !password) {
        return res
            .status(http_status_1.default.BAD_REQUEST)
            .json({ message: "All fields are required" });
    }
    try {
        const existingUser = await user_model_1.User.findOne({
            $or: [{ username }, { email }],
        });
        if (existingUser) {
            return res
                .status(http_status_1.default.CONFLICT)
                .json({ message: "User already exists" });
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const user = await user_model_1.User.create({
            username,
            name,
            email,
            password: hashedPassword,
        });
        return res.status(http_status_1.default.CREATED).json({
            message: "User registered successfully",
        });
    }
    catch (error) {
        return res
            .status(http_status_1.default.INTERNAL_SERVER_ERROR)
            .json({ message: "Signup failed", error });
    }
};
exports.signup = signup;
/* ======================================================
   LOGIN
====================================================== */
const login = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res
            .status(http_status_1.default.BAD_REQUEST)
            .json({ message: "Username and password required" });
    }
    try {
        const user = await user_model_1.User.findOne({ username });
        if (!user) {
            return res
                .status(http_status_1.default.NOT_FOUND)
                .json({ message: "User not found" });
        }
        const isValid = await bcrypt_1.default.compare(password, user.password);
        if (!isValid) {
            return res
                .status(http_status_1.default.UNAUTHORIZED)
                .json({ message: "Invalid password" });
        }
        const token = crypto_1.default.randomBytes(32).toString("hex");
        user.token = token;
        await user.save();
        return res.status(http_status_1.default.OK).json({
            token,
            username: user.username,
            name: user.name,
        });
    }
    catch (error) {
        return res
            .status(http_status_1.default.INTERNAL_SERVER_ERROR)
            .json({ message: "Login failed", error });
    }
};
exports.login = login;
/* ======================================================
   ADD MEETING TO HISTORY (NO DUPLICATES)
====================================================== */
const addMeetingHistory = async (req, res) => {
    const authHeader = req.headers.authorization;
    const { meeting_code } = req.body;
    if (!authHeader || !meeting_code) {
        return res.status(400).json({ message: "Token and meeting code required" });
    }
    const token = authHeader.split(" ")[1]; // Bearer TOKEN
    const user = await user_model_1.User.findOne({ token });
    if (!user) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
    const alreadyExists = await meeting_model_1.Meeting.findOne({
        user_id: user.username,
        meeting_code,
    });
    if (alreadyExists) {
        return res.status(200).json({ message: "Meeting already exists" });
    }
    await meeting_model_1.Meeting.create({
        user_id: user.username,
        meeting_code,
        date: new Date(),
    });
    return res.status(201).json({ message: "Meeting added to history" });
};
exports.addMeetingHistory = addMeetingHistory;
/* ======================================================
   GET MEETING HISTORY (LATEST FIRST)
====================================================== */
const getMeetingHistory = async (req, res) => {
    const token = req.query.token;
    if (!token) {
        return res
            .status(http_status_1.default.BAD_REQUEST)
            .json({ message: "Token required" });
    }
    try {
        const user = await user_model_1.User.findOne({ token });
        if (!user) {
            return res
                .status(http_status_1.default.UNAUTHORIZED)
                .json({ message: "Invalid or expired token" });
        }
        const meetings = await meeting_model_1.Meeting.find({
            user_id: user.username,
        }).sort({ date: -1 }); // 🔥 latest first
        return res.status(http_status_1.default.OK).json(meetings);
    }
    catch (error) {
        return res
            .status(http_status_1.default.INTERNAL_SERVER_ERROR)
            .json({ message: "Error fetching meeting history", error });
    }
};
exports.getMeetingHistory = getMeetingHistory;
/* ======================================================
   CHECK USERNAME AVAILABILITY
====================================================== */
const checkUsername = async (req, res) => {
    const { username } = req.query;
    if (!username) {
        return res
            .status(http_status_1.default.BAD_REQUEST)
            .json({ message: "Username required" });
    }
    const user = await user_model_1.User.findOne({ username });
    return res.json({ exists: !!user });
};
exports.checkUsername = checkUsername;
// ---------------------- GET CURRENT USER ----------------------
const getCurrentUser = async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
        return res.status(401).json({ message: "Unauthorized" });
    const user = await user_model_1.User.findOne({ token }).select("name username email gender");
    if (!user)
        return res.status(401).json({ message: "Invalid token" });
    res.json(user);
};
exports.getCurrentUser = getCurrentUser;
const updateProfile = async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
        return res.status(401).json({ message: "Unauthorized" });
    const { name, email, gender, password } = req.body;
    const user = await user_model_1.User.findOne({ token });
    if (!user)
        return res.status(401).json({ message: "Invalid token" });
    if (name)
        user.name = name;
    if (email)
        user.email = email;
    if (gender)
        user.gender = gender;
    if (password) {
        if (password.length < 8) {
            return res.status(400).json({ message: "Weak password" });
        }
        user.password = await bcrypt_1.default.hash(password, 10);
    }
    await user.save();
    res.json({ message: "Profile updated successfully" });
};
exports.updateProfile = updateProfile;
//# sourceMappingURL=user.controller.js.map