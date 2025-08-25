import React, { useEffect, useState } from "react";
import axios from "axios";
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({
    project: "",
    title: "",
    tag: "",
    color: "#cccccc"
  });
  const [editingTask, setEditingTask] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Buscar tarefas
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = () => {
    axios.get("http://localhost:3000/tasks")
      .then(res => setTasks(res.data))
      .catch(err => console.error("Erro ao buscar tarefas:", err));
  };

  // Criar ou editar task
  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingTask) {
      axios.put(`http://localhost:3000/tasks/${editingTask.id}`, form)
        .then(() => {
          fetchTasks();
          setForm({ project: "", title: "", tag: "", color: "#cccccc" });
          setEditingTask(null);
          setShowModal(false);
        })
        .catch(err => console.error("Erro ao atualizar tarefa:", err));
    } else {
      axios.post("http://localhost:3000/tasks", form)
        .then(() => {
          fetchTasks();
          setForm({ project: "", title: "", tag: "", color: "#cccccc" });
          setShowModal(false);
        })
        .catch(err => console.error("Erro ao criar tarefa:", err));
    }
  };

  // Preparar edição
  const handleEdit = (task) => {
    setEditingTask(task);
    setForm(task);
    setShowModal(true);
  };

  // Deletar task
  const handleDelete = (id) => {
    axios.delete(`http://localhost:3000/tasks/${id}`)
      .then(() => fetchTasks())
      .catch(err => console.error("Erro ao deletar tarefa:", err));
  };

  return (
    <div className="app-container">
      <div className="header">
        <h1>TaskVerse</h1>
        <button className="add-task-btn" onClick={() => setShowModal(true)}>Adicionar Tarefa</button>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <form onSubmit={handleSubmit}>
              <input type="text" placeholder="Projeto" value={form.project} onChange={e => setForm({ ...form, project: e.target.value })} required />
              <input type="text" placeholder="Título" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              <input type="text" placeholder="Tag" value={form.tag} onChange={e => setForm({ ...form, tag: e.target.value })} required />
              <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button type="submit" className="submit-btn">{editingTask ? "Salvar" : "Adicionar"}</button>
                <button type="button" className="cancel-btn" onClick={() => { setEditingTask(null); setForm({ project: "", title: "", tag: "", color: "#cccccc" }); setShowModal(false); }}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {tasks.map(task => (
        <div key={task.id} className="task-card">
          <h3>{task.project}</h3>
          <p>
            <input type="checkbox" /> {task.title}
            <span className="tag-badge" style={{ backgroundColor: task.color }}>#{task.tag}</span>
          </p>
          <div className="div-btn">
            <button className="edit-btn" onClick={() => handleEdit(task)}>Editar</button>
            <button className="delete-btn" onClick={() => handleDelete(task.id)}>Deletar</button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;