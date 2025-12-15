import { Router } from "express";
import {
  addMeetingHistory,
  getMeetingHistory,
  login,
  signup,
  updateProfile,
  getCurrentUser,
  checkUsername,
} from "../controllers/user.controller";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/meeting/add", addMeetingHistory);
router.get("/meeting/history", getMeetingHistory);
router.put("/update", updateProfile);
router.get("/me", getCurrentUser);
router.get("/checkUsername", checkUsername);

export default router;
