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

app.use(cors());
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