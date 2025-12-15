"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const router = (0, express_1.Router)();
router.post("/signup", user_controller_1.signup);
router.post("/login", user_controller_1.login);
router.post("/meeting/add", user_controller_1.addMeetingHistory);
router.get("/meeting/history", user_controller_1.getMeetingHistory);
router.put("/update", user_controller_1.updateProfile);
router.get("/me", user_controller_1.getCurrentUser);
router.get("/checkUsername", user_controller_1.checkUsername);
exports.default = router;
//# sourceMappingURL=user.routes.js.map