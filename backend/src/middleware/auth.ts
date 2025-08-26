import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  id: number;
  email: string;
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token não fornecido" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as JwtPayload;
    (req as any).user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token inválido" });
  }
}