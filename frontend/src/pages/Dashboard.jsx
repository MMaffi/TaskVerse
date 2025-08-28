import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { toast } from "react-toastify";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import "react-toastify/dist/ReactToastify.css";
import "../styles/Dashboard.css";
import "../styles/Scrollbar.css";

const API_URL = process.env.REACT_APP_API_URL;

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
        axios.get(`${API_URL}/tasks`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/projects`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/tags`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setTasks(tasksRes.data);
      setProjects(projectsRes.data);
      setTags(tagsRes.data);
    } catch {
      toast.error("Erro ao buscar dados");
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    navigate("/login");
  }

  // --- Criação / Edição ---
  async function createProject() {
    if (!newProjectName.trim()) return;
    try {
      if (editingProject) {
        await axios.put(`${API_URL}/projects/${editingProject.id}`, { name: newProjectName }, { headers: { Authorization: `Bearer ${token}` } });
        toast.success("Projeto editado com sucesso");
      } else {
        await axios.post(`${API_URL}/projects`, { name: newProjectName }, { headers: { Authorization: `Bearer ${token}` } });
        toast.success("Projeto criado com sucesso");
      }
      setNewProjectName(""); setShowProjectModal(false); setEditingProject(null); fetchData();
    } catch { toast.error("Erro ao criar/editar projeto"); }
  }

  async function createTag() {
    if (!newTagName.trim()) return;
    try {
      if (editingTag) {
        await axios.put(`${API_URL}/tags/${editingTag.id}`, { name: newTagName, color: newTagColor }, { headers: { Authorization: `Bearer ${token}` } });
        toast.success("Tag editada com sucesso");
      } else {
        await axios.post(`${API_URL}/tags`, { name: newTagName, color: newTagColor }, { headers: { Authorization: `Bearer ${token}` } });
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
        await axios.put(`${API_URL}/tasks/${editingTask.id}`, { title: newTaskTitle, project: newTaskProject, tag: newTaskTag, color, completed: editingTask.completed }, { headers: { Authorization: `Bearer ${token}` } });
        toast.success("Tarefa editada com sucesso");
      } else {
        await axios.post(`${API_URL}/tasks`, { title: newTaskTitle, project: newTaskProject, tag: newTaskTag, color, completed: 0 }, { headers: { Authorization: `Bearer ${token}` } });
        toast.success("Tarefa criada com sucesso");
      }
      cancelTaskModal(); fetchData();
    } catch { toast.error("Erro ao criar/editar tarefa"); }
  }

  // --- Toggle Completed ---
  async function toggleTaskCompletion(task) {
    try {
      await axios.put(`${API_URL}/tasks/${task.id}`, {
        ...task,
        completed: task.completed ? 0 : 1
      }, { headers: { Authorization: `Bearer ${token}` } });

      setTasks(tasks.map(t => t.id === task.id ? { ...t, completed: task.completed ? 0 : 1 } : t));
    } catch {
      toast.error("Erro ao atualizar tarefa");
    }
  }

  // --- Exclusão ---
  async function deleteTasksByProject(projectName) {
    const related = tasks.filter(t => t.project === projectName);
    for (const t of related) await axios.delete(`${API_URL}/tasks/${t.id}`, { headers: { Authorization: `Bearer ${token}` } });
  }
  async function deleteTasksByTag(tagName) {
    const related = tasks.filter(t => t.tag === tagName);
    for (const t of related) await axios.delete(`${API_URL}/tasks/${t.id}`, { headers: { Authorization: `Bearer ${token}` } });
  }

  const confirmDeleteProject = (id, name) => { const related = tasks.filter(t => t.project === name).length; setDeleteTarget({ type: "project", id, name, relatedTasks: related }); setShowDeleteModal(true); };
  const confirmDeleteTag = (id, name) => { const related = tasks.filter(t => t.tag === name).length; setDeleteTarget({ type: "tag", id, name, relatedTasks: related }); setShowDeleteModal(true); };
  const confirmDeleteTask = (id, name) => { setDeleteTarget({ type: "task", id, name, relatedTasks: 0 }); setShowDeleteModal(true); };

  const handleDelete = async () => {
    const { type, id, name } = deleteTarget;
    const typePt = { task: "Tarefa", project: "Projeto", tag: "Tag" }[type] || type;

    try {
      if (type === "task") {
        await axios.delete(`${API_URL}/tasks/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      }
      if (type === "project") {
        await deleteTasksByProject(name);
        await axios.delete(`${API_URL}/projects/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      }
      if (type === "tag") {
        await deleteTasksByTag(name);
        await axios.delete(`${API_URL}/tags/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      }

      toast.success(`${typePt} deletado(a)`);
      setShowDeleteModal(false);
      fetchData();
    } catch {
      toast.error(`Erro ao deletar ${typePt}`);
    }
  };

  // --- Modais ---
  const handleKeyDown = (e, saveFn, cancelFn) => { if (e.key === "Enter") saveFn(); if (e.key === "Escape") cancelFn(); };
  const cancelTaskModal = () => { setShowTaskModal(false); setNewTaskTitle(""); setNewTaskProject(""); setNewTaskTag(""); setIsProjectFixed(false); setEditingTask(null); };
  const cancelProjectModal = () => { setShowProjectModal(false); setNewProjectName(""); setEditingProject(null); };
  const cancelTagModal = () => { setShowTagModal(false); setNewTagName(""); setNewTagColor("#1890ff"); setEditingTag(null); };

  const openEditTaskModal = (task) => { setEditingTask(task); setNewTaskTitle(task.title); setNewTaskProject(task.project); setNewTaskTag(task.tag); setShowTaskModal(true); };
  const openEditProjectModal = (project) => { setEditingProject(project); setNewProjectName(project.name); setShowProjectModal(true); };
  const openEditTagModal = (tag) => { setEditingTag(tag); setNewTagName(tag.name); setNewTagColor(tag.color); setShowTagModal(true); };

  // --- Drag & Drop ---
  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;

    const taskId = parseInt(draggableId);

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newTasks = Array.from(tasks);
    const movedTask = newTasks.find((t) => t.id === taskId);
    if (!movedTask) return;

    movedTask.project = destination.droppableId;

    newTasks.splice(source.index, 1);
    newTasks.splice(destination.index, 0, movedTask);

    const reordered = newTasks.map((t, index) => ({
      ...t,
      order: index,
    }));

    setTasks(reordered);

    try {
      await axios.put(
        `${API_URL}/tasks/${taskId}`,
        {
          ...movedTask,
          order: destination.index,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Tarefa movida com sucesso");
    } catch {
      toast.error("Erro ao mover tarefa");
    }
  };

  return (
    <div className="dashboard">

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

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="projects-container">
            {projects.map(project => (
              <Droppable droppableId={project.name} key={project.id}>
                {(provided) => (
                  <div className="project-box" ref={provided.innerRef} {...provided.droppableProps}>
                    <div className="project-header">
                      <h3>{project.name}</h3>
                      <button className="add-task-project-btn" onClick={() => { setEditingTask(null); setNewTaskProject(project.name); setIsProjectFixed(true); setShowTaskModal(true); }}>
                        + Adicionar Tarefa
                      </button>
                    </div>
                    <ul className="task-list">
                      {tasks.filter(t => t.project === project.name).map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                          {(provided, snapshot) => (
                            <li
                              className={`task-item ${snapshot.isDragging ? "dragging" : ""}`}
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                ...provided.draggableProps.style,
                                boxShadow: snapshot.isDragging ? "0 5px 15px rgba(0,0,0,0.3)" : "none",
                                transition: "all 0.2s ease",
                              }}
                            >
                              <div className="task-header">
                                <input
                                  type="checkbox"
                                  checked={!!task.completed}
                                  onChange={() => toggleTaskCompletion(task)}
                                />
                                <span className={`task-title ${task.completed ? "completed" : ""}`}>
                                  {task.title}
                                </span>
                                <span className="task-tag" style={{ backgroundColor: task.color }}>{task.tag}</span>
                              </div>
                              <div className="task-actions">
                                <button className="edit-btn" onClick={() => openEditTaskModal(task)}>Editar</button>
                                <button className="delete-btn" onClick={() => confirmDeleteTask(task.id, task.title)}>Excluir</button>
                              </div>
                            </li>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </ul>
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* --- Modais --- */}
      {showProjectModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>{editingProject ? "Editar Projeto" : "Criar Projeto"}</h3>
            <input placeholder="Nome do projeto" value={newProjectName} onChange={e => setNewProjectName(e.target.value)} onKeyDown={e => handleKeyDown(e, createProject, cancelProjectModal)} />
            <div className="modal-buttons">
              <button onClick={cancelProjectModal}>Cancelar</button>
              <button onClick={createProject}>Salvar</button>
            </div>
          </div>
        </div>
      )}

      {showTagModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>{editingTag ? "Editar Tag" : "Criar Tag"}</h3>
            <input placeholder="Nome da tag" value={newTagName} onChange={e => setNewTagName(e.target.value)} onKeyDown={e => handleKeyDown(e, createTag, cancelTagModal)} />
            <input type="color" value={newTagColor} onChange={e => setNewTagColor(e.target.value)} />
            <div className="modal-buttons">
              <button onClick={cancelTagModal}>Cancelar</button>
              <button onClick={createTag}>Salvar</button>
            </div>
          </div>
        </div>
      )}

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
              <button onClick={cancelTaskModal}>Cancelar</button>
              <button onClick={addTask}>Salvar</button>
            </div>
          </div>
        </div>
      )}

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