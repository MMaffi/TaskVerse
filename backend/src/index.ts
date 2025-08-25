import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import taskRoutes from "./routes/tasks";
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT =  process.env.PORT;

app.use(cors());
app.use(bodyParser.json());

app.use("/tasks", taskRoutes);

app.listen(PORT, () => {
  console.log(`✅ Backend rodando em: http://localhost:${PORT}`);
});