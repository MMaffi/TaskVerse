import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import db from "../config/db";

const router = Router();

// Listar projetos
router.get("/", authMiddleware, async (req: any, res) => {
  const [projects] = await db.query("SELECT * FROM projects WHERE user_id = ?", [req.user.id]);
  res.json(projects);
});

// Criar projeto
router.post("/", authMiddleware, async (req: any, res) => {
  const { name } = req.body;
  const [result] = await db.query("INSERT INTO projects (name, user_id) VALUES (?, ?)", [name, req.user.id]);
  res.status(201).json({ id: (result as any).insertId, name });
});

// Editar projeto
router.put("/:id", authMiddleware, async (req: any, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const [result] = await db.query("UPDATE projects SET name = ? WHERE id = ? AND user_id = ?", [name, id, req.user.id]);
  if ((result as any).affectedRows === 0) return res.status(404).json({ message: "Projeto não encontrado" });
  res.json({ message: "Projeto atualizado" });
});

// Deletar projeto
router.delete("/:id", authMiddleware, async (req: any, res) => {
  const { id } = req.params;
  const [result] = await db.query("DELETE FROM projects WHERE id = ? AND user_id = ?", [id, req.user.id]);
  if ((result as any).affectedRows === 0) return res.status(404).json({ message: "Projeto não encontrado" });
  res.json({ message: "Projeto deletado" });
});

export default router;