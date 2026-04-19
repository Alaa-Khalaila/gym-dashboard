import express from "express";
import cors from "cors";
import "dotenv/config";

import authRoutes from "./routes/auth.routes.js";
import membersRoutes from "./routes/members.routes.js";
import subscriptionsRoutes from "./routes/subscriptions.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import revenueRoutes from "./routes/revenue.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL ?? "http://localhost:5173" }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/members", membersRoutes);
app.use("/api/subscriptions", subscriptionsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/revenue", revenueRoutes);

app.use(errorHandler);

export default app;
