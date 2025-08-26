import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db";

const router = Router();

interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

// Registro
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const [existing] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    const rows = existing as User[];

    if (rows.length > 0) {
      return res.status(400).json({ message: "Email já registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [
      name,
      email,
      hashedPassword,
    ]);

    res.status(201).json({ message: "Usuário registrado com sucesso" });
  } catch (err) {
    console.error("Erro no registro:", err);
    res.status(500).json({ message: "Erro no servidor" });
  }
});

// Login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    const rows = users as User[];

    if (rows.length === 0) {
      return res.status(400).json({ message: "Email ou senha incorretos" });
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Email ou senha incorretos" });
    }

    const secret = process.env.JWT_SECRET as string;
    const token = jwt.sign({ id: user.id, email: user.email }, secret, { expiresIn: "1d" });

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ message: "Erro no servidor" });
  }
});

export default router;