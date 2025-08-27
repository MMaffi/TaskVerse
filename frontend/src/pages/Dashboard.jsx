import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar"; 
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/Dashboard.css";

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tags, setTags] = useState([]);

  const [editingTask, setEditingTask] = useState(null); // objeto task completo
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);

  const [newProjectName, setNewProjectName] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#1890ff");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskTag, setNewTaskTag] = useState("");
  const [newTaskProject, setNewTaskProject] = useState("");
  const [isProjectFixed, setIsProjectFixed] = useState(false); // flag para desabilitar select

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ type: "", id: null, name: "" });

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userName = localStorage.getItem("userName") || "Usuário";

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
      toast.error("Erro ao buscar dados");
    }
  }

  useEffect(() => { fetchData(); }, []);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    navigate("/login");
  }

  async function createProject() {
    if (!newProjectName.trim()) return;
    try {
      await axios.post("http://localhost:3000/projects", { name: newProjectName }, { headers: { Authorization: `Bearer ${token}` } });
      setNewProjectName("");
      setShowProjectModal(false);
      toast.success("Projeto criado com sucesso");
      fetchData();
    } catch (err) {
      toast.error("Erro ao criar projeto");
    }
  }

  async function createTag() {
    if (!newTagName.trim()) return;
    try {
      await axios.post("http://localhost:3000/tags", { name: newTagName, color: newTagColor }, { headers: { Authorization: `Bearer ${token}` } });
      setNewTagName("");
      setNewTagColor("#1890ff");
      setShowTagModal(false);
      toast.success("Tag criada com sucesso");
      fetchData();
    } catch (err) {
      toast.error("Erro ao criar tag");
    }
  }

  async function addTask() {
    if (!newTaskTitle.trim() || !newTaskProject || !newTaskTag) return;
    const color = tags.find(t => t.name === newTaskTag)?.color || "gray";
    try {
      await axios.post("http://localhost:3000/tasks", { title: newTaskTitle, project: newTaskProject, tag: newTaskTag, color }, { headers: { Authorization: `Bearer ${token}` } });
      setNewTaskTitle("");
      setNewTaskTag("");
      setNewTaskProject("");
      setIsProjectFixed(false);
      setShowTaskModal(false);
      toast.success("Tarefa criada com sucesso");
      fetchData();
    } catch (err) {
      toast.error("Erro ao criar tarefa");
    }
  }

  async function editTask() {
    if (!editingTask.title.trim() || !editingTask.tag) return;
    const color = tags.find(t => t.name === editingTask.tag)?.color || "gray";
    try {
      await axios.put(
        `http://localhost:3000/tasks/${editingTask.id}`,
        { title: editingTask.title, project: editingTask.project, tag: editingTask.tag, color },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingTask(null);
      toast.success("Tarefa editada com sucesso");
      fetchData();
    } catch (err) {
      toast.error("Erro ao editar tarefa");
    }
  }

  function openEditModal(task) {
    setEditingTask({ ...task });
  }

  function confirmDelete(type, id, name) {
    setDeleteTarget({ type, id, name });
    setShowDeleteModal(true);
  }

  async function handleDelete() {
    const { type, id } = deleteTarget;
    try {
      if (type === "task") await axios.delete(`http://localhost:3000/tasks/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      else if (type === "project") await axios.delete(`http://localhost:3000/projects/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      else if (type === "tag") await axios.delete(`http://localhost:3000/tags/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} deletado(a)`);
      setShowDeleteModal(false);
      fetchData();
    } catch (err) {
      toast.error(`Erro ao deletar ${type}`);
    }
  }

  return (
    <div className="dashboard">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <Sidebar
        projects={projects}
        tags={tags}
        onSelectProject={() => {}}
        onCreateProject={() => setShowProjectModal(true)}
        onCreateTag={() => setShowTagModal(true)}
        onLogout={logout}
        userName={userName} 
      />

      <div className="main-content">
        <header>
          <h2>Dashboard</h2>
          <button className="add-task-btn" onClick={() => {
            setNewTaskProject("");
            setIsProjectFixed(false);
            setShowTaskModal(true);
          }}>+ Adicionar Tarefa</button>
        </header>

        <div className="projects-container">
          {projects.map(project => (
            <div key={project.id} className="project-box">
              <div className="project-header">
                <h3>{project.name}</h3>
                <button
                  className="add-task-project-btn"
                  onClick={() => {
                    setNewTaskProject(project.name);
                    setIsProjectFixed(true);
                    setShowTaskModal(true);
                  }}
                >
                  + Adicionar Tarefa
                </button>
              </div>

              <ul className="task-list">
                {tasks.filter(task => task.project === project.name).map(task => (
                  <li key={task.id} className="task-item">
                    <div className="task-header">
                      <span className="task-title">{task.title}</span>
                      <span className="task-tag" style={{ backgroundColor: task.color }}>{task.tag}</span>
                    </div>
                    <div className="task-actions">
                      <button className="edit-btn" onClick={() => openEditModal(task)}>Editar</button>
                      <button className="delete-btn" onClick={() => confirmDelete("task", task.id, task.title)}>Excluir</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Modais */}
      {showProjectModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Criar Projeto</h3>
            <input placeholder="Nome do projeto" value={newProjectName} onChange={e => setNewProjectName(e.target.value)} />
            <div className="modal-buttons">
              <button onClick={createProject}>Salvar</button>
              <button onClick={() => setShowProjectModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {showTagModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Criar Tag</h3>
            <input placeholder="Nome da tag" value={newTagName} onChange={e => setNewTagName(e.target.value)} />
            <input type="color" value={newTagColor} onChange={e => setNewTagColor(e.target.value)} />
            <div className="modal-buttons">
              <button onClick={createTag}>Salvar</button>
              <button onClick={() => setShowTagModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {showTaskModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Criar Tarefa</h3>
            <input placeholder="Título da tarefa" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} />
            <select
              value={newTaskProject}
              onChange={e => setNewTaskProject(e.target.value)}
              disabled={isProjectFixed}
            >
              <option value="">Selecione projeto</option>
              {projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
            <select value={newTaskTag} onChange={e => setNewTaskTag(e.target.value)}>
              <option value="">Selecione tag</option>
              {tags.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
            </select>
            <div className="modal-buttons">
              <button onClick={addTask}>Salvar</button>
              <button onClick={() => { setShowTaskModal(false); setNewTaskProject(""); setIsProjectFixed(false); }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {editingTask && (
        <div className="modal">
          <div className="modal-content">
            <h3>Editar Tarefa</h3>
            <input placeholder="Título da tarefa" value={editingTask.title} onChange={e => setEditingTask({...editingTask, title: e.target.value})} />
            <select value={editingTask.project} disabled>
              <option>{editingTask.project}</option>
            </select>
            <select value={editingTask.tag} onChange={e => setEditingTask({...editingTask, tag: e.target.value})}>
              {tags.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
            </select>
            <div className="modal-buttons">
              <button onClick={editTask}>Salvar</button>
              <button onClick={() => setEditingTask(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Confirmar exclusão</h3>
            <p>Deseja realmente excluir <b>{deleteTarget.name}</b>?</p>
            <div className="modal-buttons">
              <button onClick={handleDelete}>Sim, excluir</button>
              <button onClick={() => setShowDeleteModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;