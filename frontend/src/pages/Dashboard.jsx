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

  const [editingTask, setEditingTask] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [editingTag, setEditingTag] = useState(null);

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);

  const [newProjectName, setNewProjectName] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#1890ff");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskTag, setNewTaskTag] = useState("");
  const [newTaskProject, setNewTaskProject] = useState("");
  const [isProjectFixed, setIsProjectFixed] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ type: "", id: null, name: "", relatedTasks: 0 });

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userName = localStorage.getItem("userName") || "Usuário";

  useEffect(() => { fetchData(); }, []);

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
      toast.error("Erro ao buscar dados");
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    navigate("/login");
  }

  // --- Criação ---
  async function createProject() {
    if (!newProjectName.trim()) return;
    try {
      if (editingProject) {
        await axios.put(`http://localhost:3000/projects/${editingProject.id}`, { name: newProjectName }, { headers: { Authorization: `Bearer ${token}` } });
        toast.success("Projeto editado com sucesso");
      } else {
        await axios.post("http://localhost:3000/projects", { name: newProjectName }, { headers: { Authorization: `Bearer ${token}` } });
        toast.success("Projeto criado com sucesso");
      }
      setNewProjectName(""); setShowProjectModal(false); setEditingProject(null); fetchData();
    } catch { toast.error("Erro ao criar/editar projeto"); }
  }

  async function createTag() {
    if (!newTagName.trim()) return;
    try {
      if (editingTag) {
        await axios.put(`http://localhost:3000/tags/${editingTag.id}`, { name: newTagName, color: newTagColor }, { headers: { Authorization: `Bearer ${token}` } });
        toast.success("Tag editada com sucesso");
      } else {
        await axios.post("http://localhost:3000/tags", { name: newTagName, color: newTagColor }, { headers: { Authorization: `Bearer ${token}` } });
        toast.success("Tag criada com sucesso");
      }
      setNewTagName(""); setNewTagColor("#1890ff"); setShowTagModal(false); setEditingTag(null); fetchData();
    } catch { toast.error("Erro ao criar/editar tag"); }
  }

  async function addTask() {
    if (!newTaskTitle.trim() || !newTaskProject || !newTaskTag) return toast.warning("Preencha todos os campos");
    const color = tags.find(t => t.name === newTaskTag)?.color || "gray";
    try {
      if (editingTask) {
        await axios.put(`http://localhost:3000/tasks/${editingTask.id}`, { title: newTaskTitle, project: newTaskProject, tag: newTaskTag, color }, { headers: { Authorization: `Bearer ${token}` } });
        toast.success("Tarefa editada com sucesso");
      } else {
        await axios.post("http://localhost:3000/tasks", { title: newTaskTitle, project: newTaskProject, tag: newTaskTag, color }, { headers: { Authorization: `Bearer ${token}` } });
        toast.success("Tarefa criada com sucesso");
      }
      cancelTaskModal(); fetchData();
    } catch { toast.error("Erro ao criar/editar tarefa"); }
  }

  // --- Exclusão ---
  async function deleteTasksByProject(projectName) {
    const related = tasks.filter(t => t.project === projectName);
    for (const t of related) await axios.delete(`http://localhost:3000/tasks/${t.id}`, { headers: { Authorization: `Bearer ${token}` } });
  }
  async function deleteTasksByTag(tagName) {
    const related = tasks.filter(t => t.tag === tagName);
    for (const t of related) await axios.delete(`http://localhost:3000/tasks/${t.id}`, { headers: { Authorization: `Bearer ${token}` } });
  }

  const confirmDeleteProject = (id, name) => { const related = tasks.filter(t => t.project === name).length; setDeleteTarget({ type: "project", id, name, relatedTasks: related }); setShowDeleteModal(true); };
  const confirmDeleteTag = (id, name) => { const related = tasks.filter(t => t.tag === name).length; setDeleteTarget({ type: "tag", id, name, relatedTasks: related }); setShowDeleteModal(true); };
  const confirmDeleteTask = (id, name) => { setDeleteTarget({ type: "task", id, name, relatedTasks: 0 }); setShowDeleteModal(true); };

  const handleDelete = async () => {
    const { type, id, name } = deleteTarget;
    try {
      if (type === "task") await axios.delete(`http://localhost:3000/tasks/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (type === "project") { await deleteTasksByProject(name); await axios.delete(`http://localhost:3000/projects/${id}`, { headers: { Authorization: `Bearer ${token}` } }); }
      if (type === "tag") { await deleteTasksByTag(name); await axios.delete(`http://localhost:3000/tags/${id}`, { headers: { Authorization: `Bearer ${token}` } }); }
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} deletado(a)`); setShowDeleteModal(false); fetchData();
    } catch { toast.error(`Erro ao deletar ${type}`); }
  };

  // --- Modais ---
  const handleKeyDown = (e, saveFn, cancelFn) => { if (e.key === "Enter") saveFn(); if (e.key === "Escape") cancelFn(); };
  const cancelTaskModal = () => { setShowTaskModal(false); setNewTaskTitle(""); setNewTaskProject(""); setNewTaskTag(""); setIsProjectFixed(false); setEditingTask(null); };
  const cancelProjectModal = () => { setShowProjectModal(false); setNewProjectName(""); setEditingProject(null); };
  const cancelTagModal = () => { setShowTagModal(false); setNewTagName(""); setNewTagColor("#1890ff"); setEditingTag(null); };
  const openEditTaskModal = (task) => { setEditingTask(task); setNewTaskTitle(task.title); setNewTaskProject(task.project); setNewTaskTag(task.tag); setShowTaskModal(true); };

  // --- Editar projeto/tag via modal ---
  const openEditProjectModal = (project) => { setEditingProject(project); setNewProjectName(project.name); setShowProjectModal(true); };
  const openEditTagModal = (tag) => { setEditingTag(tag); setNewTagName(tag.name); setNewTagColor(tag.color); setShowTagModal(true); };

  return (
    <div className="dashboard">
      <ToastContainer position="top-right" autoClose={3000} />

      <Sidebar
        projects={projects} tags={tags}
        onCreateProject={() => { setEditingProject(null); setNewProjectName(""); setShowProjectModal(true); }}
        onDeleteProject={confirmDeleteProject}
        onEditProject={openEditProjectModal}
        onCreateTag={() => { setEditingTag(null); setNewTagName(""); setNewTagColor("#1890ff"); setShowTagModal(true); }}
        onDeleteTag={confirmDeleteTag}
        onEditTag={openEditTagModal}
        onLogout={logout}
        userName={userName}
      />

      <div className="main-content">
        <header>
          <h2>Dashboard</h2>
          <button className="add-task-btn" onClick={() => { setEditingTask(null); setNewTaskProject(""); setIsProjectFixed(false); setShowTaskModal(true); }}>
            + Adicionar Tarefa
          </button>
        </header>

        <div className="projects-container">
          {projects.map(project => (
            <div key={project.id} className="project-box">
              <div className="project-header">
                <h3>{project.name}</h3>
                <button className="add-task-project-btn" onClick={() => { setEditingTask(null); setNewTaskProject(project.name); setIsProjectFixed(true); setShowTaskModal(true); }}>
                  + Adicionar Tarefa
                </button>
              </div>
              <ul className="task-list">
                {tasks.filter(t => t.project === project.name).map(task => (
                  <li key={task.id} className="task-item">
                    <div className="task-header">
                      <span className="task-title">{task.title}</span>
                      <span className="task-tag" style={{ backgroundColor: task.color }}>{task.tag}</span>
                    </div>
                    <div className="task-actions">
                      <button className="edit-btn" onClick={() => openEditTaskModal(task)}>Editar</button>
                      <button className="delete-btn" onClick={() => confirmDeleteTask(task.id, task.title)}>Excluir</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Aqui você pode reutilizar os modais de criação/edição como antes */}
      {/* Project Modal */}
      {showProjectModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>{editingProject ? "Editar Projeto" : "Criar Projeto"}</h3>
            <input placeholder="Nome do projeto" value={newProjectName} onChange={e => setNewProjectName(e.target.value)} onKeyDown={e => handleKeyDown(e, createProject, cancelProjectModal)} />
            <div className="modal-buttons">
              <button onClick={createProject}>Salvar</button>
              <button onClick={cancelProjectModal}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Tag Modal */}
      {showTagModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>{editingTag ? "Editar Tag" : "Criar Tag"}</h3>
            <input placeholder="Nome da tag" value={newTagName} onChange={e => setNewTagName(e.target.value)} onKeyDown={e => handleKeyDown(e, createTag, cancelTagModal)} />
            <input type="color" value={newTagColor} onChange={e => setNewTagColor(e.target.value)} />
            <div className="modal-buttons">
              <button onClick={createTag}>Salvar</button>
              <button onClick={cancelTagModal}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>{editingTask ? "Editar Tarefa" : "Criar Tarefa"}</h3>
            <input placeholder="Título da tarefa" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} onKeyDown={e => handleKeyDown(e, addTask, cancelTaskModal)} />
            <select value={newTaskProject} disabled={isProjectFixed} onChange={e => setNewTaskProject(e.target.value)}>
              <option value="">Selecione projeto</option>
              {projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
            <select value={newTaskTag} onChange={e => setNewTaskTag(e.target.value)}>
              <option value="">Selecione tag</option>
              {tags.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
            </select>
            <div className="modal-buttons">
              <button onClick={addTask}>Salvar</button>
              <button onClick={cancelTaskModal}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Confirmar exclusão</h3>
            <p>Deseja realmente excluir <b>{deleteTarget.name}</b>?</p>
            {deleteTarget.relatedTasks > 0 && <p>Isso excluirá {deleteTarget.relatedTasks} tarefa(s) relacionada(s).</p>}
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