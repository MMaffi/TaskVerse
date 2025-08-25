import { Router } from "express";
import { Task } from "../models/task";

const router = Router();

let tasks: Task[] = [
  { id: 1, project: "Meu Projeto", title: "Minhas atividades", tag: "Tag" },
  { id: 2, project: "Meu Outro Projeto", title: "Minhas atividades 2", tag: "Tag2" }
];

router.get("/", (req, res) => {
  res.json(tasks);
});

router.post("/", (req, res) => {
  const { project, title, tag } = req.body;
  const newTask: Task = {
    id: tasks.length + 1,
    project,
    title,
    tag
  };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

export default router;