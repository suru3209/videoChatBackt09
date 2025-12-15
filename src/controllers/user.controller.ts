import { Request, Response } from "express";
import { User } from "../models/user.model";
import { Meeting } from "../models/meeting.model";
import bcrypt from "bcrypt";
import crypto from "crypto";
import httpStatus from "http-status";

/* ======================================================
   SIGNUP
====================================================== */
export const signup = async (req: Request, res: Response) => {
  const { name, username, email, password } = req.body;

  if (!username || !name || !email || !password) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "All fields are required" });
  }

  try {
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return res
        .status(httpStatus.CONFLICT)
        .json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      name,
      email,
      password: hashedPassword,
    });

    return res.status(httpStatus.CREATED).json({
      message: "User registered successfully",
    });
  } catch (error) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "Signup failed", error });
  }
};

/* ======================================================
   LOGIN
====================================================== */
export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "Username and password required" });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "User not found" });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ message: "Invalid password" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.token = token;
    await user.save();

    return res.status(httpStatus.OK).json({
      token,
      username: user.username,
      name: user.name,
    });
  } catch (error) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "Login failed", error });
  }
};

/* ======================================================
   ADD MEETING TO HISTORY (NO DUPLICATES)
====================================================== */
export const addMeetingHistory = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const { meeting_code } = req.body;

  if (!authHeader || !meeting_code) {
    return res.status(400).json({ message: "Token and meeting code required" });
  }

  const token = authHeader.split(" ")[1]; // Bearer TOKEN

  const user = await User.findOne({ token });
  if (!user) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  const alreadyExists = await Meeting.findOne({
    user_id: user.username,
    meeting_code,
  });

  if (alreadyExists) {
    return res.status(200).json({ message: "Meeting already exists" });
  }

  await Meeting.create({
    user_id: user.username,
    meeting_code,
    date: new Date(),
  });

  return res.status(201).json({ message: "Meeting added to history" });
};

/* ======================================================
   GET MEETING HISTORY (LATEST FIRST)
====================================================== */
export const getMeetingHistory = async (req: Request, res: Response) => {
  const token = req.query.token as string;

  if (!token) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "Token required" });
  }

  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ message: "Invalid or expired token" });
    }

    const meetings = await Meeting.find({
      user_id: user.username,
    }).sort({ date: -1 }); // 🔥 latest first

    return res.status(httpStatus.OK).json(meetings);
  } catch (error) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "Error fetching meeting history", error });
  }
};

/* ======================================================
   CHECK USERNAME AVAILABILITY
====================================================== */
export const checkUsername = async (req: Request, res: Response) => {
  const { username } = req.query;

  if (!username) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "Username required" });
  }

  const user = await User.findOne({ username });
  return res.json({ exists: !!user });
};

// ---------------------- GET CURRENT USER ----------------------
export const getCurrentUser = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  const user = await User.findOne({ token }).select(
    "name username email gender"
  );

  if (!user) return res.status(401).json({ message: "Invalid token" });

  res.json(user);
};

export const updateProfile = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  const { name, email, gender, password } = req.body;

  const user = await User.findOne({ token });
  if (!user) return res.status(401).json({ message: "Invalid token" });

  if (name) user.name = name;
  if (email) user.email = email;
  if (gender) user.gender = gender;

  if (password) {
    if (password.length < 8) {
      return res.status(400).json({ message: "Weak password" });
    }
    user.password = await bcrypt.hash(password, 10);
  }

  await user.save();

  res.json({ message: "Profile updated successfully" });
};
