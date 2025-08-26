import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar"; 
import "../styles/Dashboard.css";

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tags, setTags] = useState([]);

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingTag, setEditingTag] = useState("");
  const [editingColor, setEditingColor] = useState("gray");

  // Modais
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);

  const [newProjectName, setNewProjectName] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#1890ff");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskTag, setNewTaskTag] = useState("");
  const [newTaskProject, setNewTaskProject] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Fetch data
  async function fetchData() {
    try {
      const [tasksRes, projectsRes, tagsRes] = await Promise.all([
        axios.get("http://localhost:3000/tasks", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("http://localhost:3000/projects", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("http://localhost:3000/tags", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setTasks(tasksRes.data);
      setProjects(projectsRes.data);
      setTags(tagsRes.data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => { fetchData(); }, []);

  // Logout
  function logout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  // Criar Project
  async function createProject() {
    if (!newProjectName.trim()) return;
    try {
      await axios.post(
        "http://localhost:3000/projects",
        { name: newProjectName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewProjectName("");
      setShowProjectModal(false);
      fetchData();
    } catch (err) {
      alert("Erro ao criar projeto");
    }
  }

  // Criar Tag
  async function createTag() {
    if (!newTagName.trim()) return;
    try {
      await axios.post(
        "http://localhost:3000/tags",
        { name: newTagName, color: newTagColor },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewTagName("");
      setNewTagColor("gray");
      setShowTagModal(false);
      fetchData();
    } catch (err) {
      alert("Erro ao criar tag");
    }
  }

  // Criar Task
  async function addTask() {
    if (!newTaskTitle.trim() || !newTaskProject || !newTaskTag) return;
    const color = tags.find(t => t.name === newTaskTag)?.color || "gray";
    try {
      await axios.post(
        "http://localhost:3000/tasks",
        { title: newTaskTitle, project: newTaskProject, tag: newTaskTag, color },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewTaskTitle("");
      setNewTaskTag("");
      setNewTaskProject("");
      setShowTaskModal(false);
      fetchData();
    } catch (err) {
      alert("Erro ao criar tarefa");
    }
  }

  // Editar task
  function startEditing(task) {
    setEditingTaskId(task.id);
    setEditingTitle(task.title);
    setEditingTag(task.tag);
    setEditingColor(task.color);
  }

  async function saveEdit(taskId) {
    if (!editingTitle.trim() || !editingTag) return;
    const color = tags.find(t => t.name === editingTag)?.color || "gray";
    try {
      await axios.put(
        `http://localhost:3000/tasks/${taskId}`,
        { title: editingTitle, project: tasks.find(t => t.id === taskId)?.project, tag: editingTag, color },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingTaskId(null);
      setEditingTitle("");
      setEditingTag("");
      setEditingColor("gray");
      fetchData();
    } catch (err) {
      alert("Erro ao editar tarefa");
    }
  }

  // Deletar task
  async function deleteTask(id) {
    try {
      await axios.delete(`http://localhost:3000/tasks/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchData();
    } catch (err) {
      alert("Erro ao deletar tarefa");
    }
  }

  return (
    <div className="dashboard">
      <Sidebar
        projects={projects}
        tags={tags}
        onSelectProject={() => {}}
        onCreateProject={() => setShowProjectModal(true)}
        onCreateTag={() => setShowTagModal(true)}
        onLogout={logout}
      />

      <div className="main-content">
        <header>
          <h2>Dashboard</h2>
          <button className="add-task-btn" onClick={() => setShowTaskModal(true)}>
            + Adicionar Tarefa
          </button>
        </header>

        {/* Lista de projetos */}
        <div className="projects-container">
          {projects.map(project => (
            <div key={project.id} className="project-box">
              <div className="project-header">
                <h3>{project.name}</h3>
                <button
                  className="add-task-project-btn"
                  onClick={() => {
                    setNewTaskProject(project.name);
                    setShowTaskModal(true);
                  }}
                >
                  + Adicionar Tarefa
                </button>
              </div>

              <ul className="task-list">
                {tasks.filter(task => task.project === project.name).map(task => (
                  <li key={task.id} className="task-item">
                    {editingTaskId === task.id ? (
                      <>
                        <input value={editingTitle} onChange={e => setEditingTitle(e.target.value)} />
                        <select value={editingTag} onChange={e => setEditingTag(e.target.value)}>
                          {tags.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                        </select>
                        <button className="save-btn" onClick={() => saveEdit(task.id)}>Salvar</button>
                        <button className="cancel-btn" onClick={() => setEditingTaskId(null)}>Cancelar</button>
                      </>
                    ) : (
                      <>
                        <div className="task-header">
                          <span className="task-title">{task.title}</span>
                          <span className="task-tag" style={{ backgroundColor: task.color }}>
                            {task.tag}
                          </span>
                        </div>
                        <div className="task-actions">
                          <button className="edit-btn" onClick={() => startEditing(task)}>Editar</button>
                          <button className="delete-btn" onClick={() => deleteTask(task.id)}>Excluir</button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Criar Projeto */}
      {showProjectModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Criar Projeto</h3>
            <input
              placeholder="Nome do projeto"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
            />
            <div className="modal-buttons">
              <button onClick={createProject}>Salvar</button>
              <button onClick={() => setShowProjectModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Criar Tag */}
      {showTagModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Criar Tag</h3>
            <input
              placeholder="Nome da tag"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
            />
            <input
              type="color"
              value={newTagColor}
              onChange={(e) => setNewTagColor(e.target.value)}
            />
            <div className="modal-buttons">
              <button onClick={createTag}>Salvar</button>
              <button onClick={() => setShowTagModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Criar Tarefa */}
      {showTaskModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Criar Tarefa</h3>
            <input
              placeholder="Título da tarefa"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
            />
            <select value={newTaskProject} onChange={e => setNewTaskProject(e.target.value)}>
              <option value="">Selecione projeto</option>
              {projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
            <select value={newTaskTag} onChange={e => setNewTaskTag(e.target.value)}>
              <option value="">Selecione tag</option>
              {tags.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
            </select>
            <div className="modal-buttons">
              <button onClick={addTask}>Salvar</button>
              <button onClick={() => setShowTaskModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Dashboard;