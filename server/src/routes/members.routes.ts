import { Router } from "express";
import { authenticate, requireRole } from "../middleware/authenticate.js";
import * as ctrl from "../controllers/members.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", ctrl.getAll);
router.post("/", ctrl.create);
router.get("/:id", ctrl.getOne);
router.put("/:id", ctrl.update);
router.delete("/:id", requireRole("super_admin"), ctrl.remove);

export default router;
