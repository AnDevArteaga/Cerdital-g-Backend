import "./polyfill";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger";
import authRoutes from "./routes/auth.routes";
import batchRoutes from "./routes/batch.routes";
import feedingRoutes from "./routes/feeding.routes";
import healthRoutes from "./routes/health.routes";
import financeRoutes from "./routes/finance.routes";
import progressRoutes from "./routes/progress.routes";
import listRoutes from "./routes/list.routes";
import homeRoutes from "./routes/home.routes";
import pushRoutes from "./routes/push.routes";
import agendaRoutes from "./routes/agenda.routes";
import syncRoutes from "./routes/sync.routes";
import adminRoutes from "./routes/admin.routes";

export const app = express();

app.get("/api-docs.json", (_req, res) => {
    res.json(swaggerSpec);
});
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "Cerdital G",
    swaggerOptions: {
        persistAuthorization: true,
        docExpansion: "list",
        defaultModelsExpandDepth: 0,
    },
}));
app.use(express.json());
app.use(morgan("dev"));
app.use(helmet());
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
}));

app.get("/health", (_req, res) => {
    res.status(200).json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/batch", batchRoutes);
app.use("/api/feeding", feedingRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/list", listRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/agenda", agendaRoutes);
app.use("/api/push", pushRoutes);
app.use("/api/sync", syncRoutes);
app.use("/api/admin", adminRoutes);
