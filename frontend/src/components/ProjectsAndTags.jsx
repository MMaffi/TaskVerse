import { useEffect, useState } from "react";
import axios from "axios";

function ProjectsAndTags() {
  const [projects, setProjects] = useState([]);
  const [tags, setTags] = useState([]);
  const [newProject, setNewProject] = useState("");
  const [newTag, setNewTag] = useState({ name: "", color: "gray" });
  const token = localStorage.getItem("token");

  // Fetch
  async function fetchData() {
    const projRes = await axios.get("http://localhost:3000/projects", { headers: { Authorization: `Bearer ${token}` } });
    setProjects(projRes.data);
    const tagRes = await axios.get("http://localhost:3000/tags", { headers: { Authorization: `Bearer ${token}` } });
    setTags(tagRes.data);
  }

  useEffect(() => { fetchData(); }, []);

  // CRUD Projetos
  async function addProject() {
    if (!newProject.trim()) return;
    await axios.post("http://localhost:3000/projects", { name: newProject }, { headers: { Authorization: `Bearer ${token}` } });
    setNewProject(""); fetchData();
  }

  async function editProject(id, name) {
    await axios.put(`http://localhost:3000/projects/${id}`, { name }, { headers: { Authorization: `Bearer ${token}` } });
    fetchData();
  }

  async function deleteProject(id) {
    await axios.delete(`http://localhost:3000/projects/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    fetchData();
  }

  // CRUD Tags
  async function addTag() {
    if (!newTag.name.trim()) return;
    await axios.post("http://localhost:3000/tags", newTag, { headers: { Authorization: `Bearer ${token}` } });
    setNewTag({ name: "", color: "gray" }); fetchData();
  }

  async function editTag(id, name, color) {
    await axios.put(`http://localhost:3000/tags/${id}`, { name, color }, { headers: { Authorization: `Bearer ${token}` } });
    fetchData();
  }

  async function deleteTag(id) {
    await axios.delete(`http://localhost:3000/tags/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    fetchData();
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Projetos</h2>
      <input value={newProject} onChange={e => setNewProject(e.target.value)} placeholder="Novo projeto" />
      <button onClick={addProject}>Adicionar</button>
      <ul>
        {projects.map(p => (
          <li key={p.id}>
            {p.name}
            <button onClick={() => editProject(p.id, prompt("Novo nome", p.name))}>Editar</button>
            <button onClick={() => deleteProject(p.id)}>Excluir</button>
          </li>
        ))}
      </ul>

      <h2>Tags</h2>
      <input value={newTag.name} onChange={e => setNewTag({ ...newTag, name: e.target.value })} placeholder="Nova tag" />
      <input type="color" value={newTag.color} onChange={e => setNewTag({ ...newTag, color: e.target.value })} />
      <button onClick={addTag}>Adicionar</button>
      <ul>
        {tags.map(t => (
          <li key={t.id}>
            <span style={{ backgroundColor: t.color, padding: "2px 6px", borderRadius: "4px" }}>{t.name}</span>
            <button onClick={() => editTag(t.id, prompt("Novo nome", t.name), prompt("Nova cor", t.color))}>Editar</button>
            <button onClick={() => deleteTag(t.id)}>Excluir</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProjectsAndTags;