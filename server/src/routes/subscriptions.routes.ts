import { Router } from "express";
import { authenticate, requireRole } from "../middleware/authenticate.js";
import * as ctrl from "../controllers/subscriptions.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", ctrl.getAll);
router.get("/plans", ctrl.getPlans);
router.post("/", ctrl.create);
router.get("/member/:memberId", ctrl.getMemberSubscriptions);
router.patch("/plans/:id/price", requireRole("super_admin"), ctrl.updatePlanPrice);

export default router;
