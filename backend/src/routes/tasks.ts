import { Router, Request, Response } from "express";
import { db } from "../config/db";
import { Task } from "../models/task";

const router = Router();

// GET all tasks
router.get("/", async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query("SELECT * FROM tasks");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar tarefas" });
  }
});

// POST new task
router.post("/", async (req: Request, res: Response) => {
  const { project, title, tag, color }: { project: string; title: string; tag: string; color?: string } = req.body;

  try {
    const [result]: any = await db.query(
      "INSERT INTO tasks (project, title, tag, color) VALUES (?, ?, ?, ?)",
      [project, title, tag, color || "gray"]
    );

    const newTask: Task = {
      id: result.insertId,
      project,
      title,
      tag,
      color: color || "gray"
    };

    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar tarefa" });
  }
});

// PUT update task
router.put("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { project, title, tag, color }: Task = req.body;

  try {
    await db.query(
      "UPDATE tasks SET project=?, title=?, tag=?, color=? WHERE id=?",
      [project, title, tag, color, id]
    );
    res.json({ id, project, title, tag, color });
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar tarefa" });
  }
});

// DELETE task
router.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await db.query("DELETE FROM tasks WHERE id=?", [id]);
    res.json({ message: "Tarefa deletada com sucesso" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar tarefa" });
  }
});

export default router;