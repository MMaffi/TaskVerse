import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import taskRoutes from "./routes/tasks";
import authRoutes from "./routes/auth";
import projectsRouter from "./routes/projects";
import tagsRouter from "./routes/tags";
import * as dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// --- Configurando CORS ---
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "").split(",");

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS não permitido para o origin: ${origin}`));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

// --- Rotas ---
app.use("/auth", authRoutes);
app.use("/projects", projectsRouter);
app.use("/tags", tagsRouter);
app.use("/tasks", taskRoutes);

// --- Inicializando servidor ---
app.listen(PORT, () => {
  console.log(`✅ Backend rodando em: http://localhost:${PORT}`);
});