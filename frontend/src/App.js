import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({
    project: "",
    title: "",
    tag: "",
    color: "#cccccc"
  });
  const [editingTask, setEditingTask] = useState(null);

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
      // Atualizar tarefa existente
      axios.put(`http://localhost:3000/tasks/${editingTask.id}`, form)
        .then(() => {
          fetchTasks();
          setForm({ project: "", title: "", tag: "", color: "#cccccc" });
          setEditingTask(null);
        })
        .catch(err => console.error("Erro ao atualizar tarefa:", err));
    } else {
      // Criar nova tarefa
      axios.post("http://localhost:3000/tasks", form)
        .then(() => {
          fetchTasks();
          setForm({ project: "", title: "", tag: "", color: "#cccccc" });
        })
        .catch(err => console.error("Erro ao criar tarefa:", err));
    }
  };

  // Preparar edição
  const handleEdit = (task) => {
    setEditingTask(task);
    setForm(task);
  };

  // Deletar task
  const handleDelete = (id) => {
    axios.delete(`http://localhost:3000/tasks/${id}`)
      .then(() => fetchTasks())
      .catch(err => console.error("Erro ao deletar tarefa:", err));
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>TaskVerse</h1>

      {/* Formulário */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input 
          type="text" 
          placeholder="Projeto" 
          value={form.project} 
          onChange={e => setForm({ ...form, project: e.target.value })} 
          required
        />
        <input 
          type="text" 
          placeholder="Título" 
          value={form.title} 
          onChange={e => setForm({ ...form, title: e.target.value })} 
          required
        />
        <input 
          type="text" 
          placeholder="Tag" 
          value={form.tag} 
          onChange={e => setForm({ ...form, tag: e.target.value })} 
          required
        />
        <input 
          type="color" 
          value={form.color} 
          onChange={e => setForm({ ...form, color: e.target.value })} 
        />
        <button type="submit">
          {editingTask ? "Salvar Alterações" : "Adicionar Tarefa"}
        </button>
        {editingTask && (
          <button type="button" onClick={() => {
            setEditingTask(null);
            setForm({ project: "", title: "", tag: "", color: "#cccccc" });
          }}>
            Cancelar
          </button>
        )}
      </form>

      {/* Lista de tarefas */}
      {tasks.map(task => (
        <div 
          key={task.id} 
          style={{
            border: "1px solid #ccc", 
            borderRadius: "8px", 
            margin: "10px 0", 
            padding: "10px"
          }}
        >
          <h3>{task.project}</h3>
          <p>
            <input type="checkbox" /> {task.title}
            <span style={{
              marginLeft: "10px", 
              backgroundColor: task.color, 
              padding: "2px 6px", 
              borderRadius: "4px"
            }}>
              #{task.tag}
            </span>
          </p>
          <button onClick={() => handleEdit(task)}>Editar</button>
          <button onClick={() => handleDelete(task.id)} style={{ marginLeft: "10px", color: "red" }}>
            Deletar
          </button>
        </div>
      ))}
    </div>
  );
}

export default App;