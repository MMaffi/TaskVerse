import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware/auth";
import db from "../config/db";

// Extensão para req.user
interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}

const router = Router();

// LISTAR TODAS AS TASKS DO USUÁRIO
router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const [tasks] = await db.query(
      "SELECT * FROM tasks WHERE user_id = ?",
      [req.user!.id]
    );
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao buscar tarefas" });
  }
});

// CRIAR UMA TASK
router.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  const { project, title, tag, color } = req.body;
  if (!title) return res.status(400).json({ message: "Título obrigatório" });

  try {
    const [result] = await db.query(
      "INSERT INTO tasks (project, title, tag, color, user_id) VALUES (?, ?, ?, ?, ?)",
      [project || "Meu Projeto", title, tag || "Tag", color || "gray", req.user!.id]
    );
    res.status(201).json({ message: "Tarefa criada", taskId: (result as any).insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao criar tarefa" });
  }
});

// EDITAR UMA TASK
router.put("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { title, tag, color } = req.body;

  try {
    const [result] = await db.query(
      "UPDATE tasks SET title = ?, tag = ?, color = ? WHERE id = ? AND user_id = ?",
      [title, tag, color, id, req.user!.id]
    );

    if ((result as any).affectedRows === 0) {
      return res.status(404).json({ message: "Tarefa não encontrada" });
    }

    res.json({ message: "Tarefa atualizada" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao atualizar tarefa" });
  }
});

// DELETAR UMA TASK
router.delete("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const [result] = await db.query(
      "DELETE FROM tasks WHERE id = ? AND user_id = ?",
      [id, req.user!.id]
    );

    if ((result as any).affectedRows === 0) {
      return res.status(404).json({ message: "Tarefa não encontrada" });
    }

    res.json({ message: "Tarefa deletada" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao deletar tarefa" });
  }
});

export default router;