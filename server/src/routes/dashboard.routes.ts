import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { getStats } from "../controllers/dashboard.controller.js";

const router = Router();

router.use(authenticate);
router.get("/stats", getStats);

export default router;
