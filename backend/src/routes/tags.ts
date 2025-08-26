import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import db from "../config/db";

const router = Router();

// Listar tags
router.get("/", authMiddleware, async (req: any, res) => {
  const [tags] = await db.query("SELECT * FROM tags WHERE user_id = ?", [req.user.id]);
  res.json(tags);
});

// Criar tag
router.post("/", authMiddleware, async (req: any, res) => {
  const { name, color } = req.body;
  const [result] = await db.query("INSERT INTO tags (name, color, user_id) VALUES (?, ?, ?)", [name, color, req.user.id]);
  res.status(201).json({ id: (result as any).insertId, name, color });
});

// Editar tag
router.put("/:id", authMiddleware, async (req: any, res) => {
  const { id } = req.params;
  const { name, color } = req.body;
  const [result] = await db.query("UPDATE tags SET name = ?, color = ? WHERE id = ? AND user_id = ?", [name, color, id, req.user.id]);
  if ((result as any).affectedRows === 0) return res.status(404).json({ message: "Tag não encontrada" });
  res.json({ message: "Tag atualizada" });
});

// Deletar tag
router.delete("/:id", authMiddleware, async (req: any, res) => {
  const { id } = req.params;
  const [result] = await db.query("DELETE FROM tags WHERE id = ? AND user_id = ?", [id, req.user.id]);
  if ((result as any).affectedRows === 0) return res.status(404).json({ message: "Tag não encontrada" });
  res.json({ message: "Tag deletada" });
});

export default router;