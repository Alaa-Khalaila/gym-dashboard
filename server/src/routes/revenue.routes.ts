import { Router } from "express";
import { authenticate, requireRole } from "../middleware/authenticate.js";
import { get } from "../controllers/revenue.controller.js";

const router = Router();

router.use(authenticate, requireRole("super_admin"));
router.get("/", get);

export default router;
