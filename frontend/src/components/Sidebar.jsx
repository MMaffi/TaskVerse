import { useState, useEffect } from "react";
import "../styles/Sidebar.css";

export default function Sidebar({
  projects = [],
  tags = [],
  onSelectProject,
  onEditProject,
  onDeleteProject,
  onCreateProject,
  onEditTag,
  onDeleteTag,
  onCreateTag,
  onLogout,
  userName = "Usuário"
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [activeItem, setActiveItem] = useState(null);
  const [activeType, setActiveType] = useState(null);

  // estados para colapsar Projetos e Tags
  const [projectsOpen, setProjectsOpen] = useState(true);
  const [tagsOpen, setTagsOpen] = useState(true);

  const handleItemClick = (id, type) => {
    if (!isOpen) setIsOpen(true);

    if (activeItem === id && activeType === type) {
      setActiveItem(null);
      setActiveType(null);
    } else {
      setActiveItem(id);
      setActiveType(type);
    }
  };

  // Novo: toggle de seção que abre sidebar se estiver colapsada
  const toggleSection = (section) => {
    if (!isOpen) {
      setIsOpen(true);
      if (section === "projects") setProjectsOpen(true);
      if (section === "tags") setTagsOpen(true);
      return;
    }

    if (section === "projects") setProjectsOpen((prev) => !prev);
    if (section === "tags") setTagsOpen((prev) => !prev);
  };

  // Listener para Ctrl + B
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Função para decidir a cor do texto baseado na cor de fundo
  const getTextColor = (backgroundColor) => {
    if (!backgroundColor) return "black";

    const hex = backgroundColor.replace("#", "");
    if (hex.length !== 6) return "black";

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? "black" : "white";
  };

  return (
    <div className={`sidebar ${isOpen ? "open" : "collapsed"}`}>
      {/* Header */}
      <div className="sidebar-header">
        <button className="menu-btn" onClick={() => setIsOpen(!isOpen)}>☰</button>
        {isOpen && <h2 className="sidebar-title">Olá, {userName}</h2>}
        {isOpen && <button className="logout-btn-sidebar" onClick={onLogout}>Sair</button>}
      </div>

      {/* Conteúdo */}
      <div className="sidebar-content">
        {/* Projetos */}
        <div className="projects-section">
          <div className="section-header">
            {isOpen ? (
              <>
                <h4
                  onClick={() => toggleSection("projects")}
                  style={{ cursor: "pointer", userSelect: "none" }}
                >
                  {projectsOpen ? "▼" : "▶"} Projetos
                </h4>
                <button className="new-project-btn" onClick={onCreateProject}>+ Novo</button>
              </>
            ) : (
              <span
                className="compact-header"
                title="Projetos"
                onClick={() => toggleSection("projects")}
                style={{ cursor: "pointer" }}
              >
                📁
              </span>
            )}
          </div>

          {projectsOpen && (
            <div className={`projects-list ${isOpen ? "" : "compact"}`}>
              {projects.map((project) => (
                <div key={project.id} className="project-item-wrapper">
                  <div
                    className="project-item"
                    onClick={() => handleItemClick(project.id, "project")}
                    title={project.name}
                  >
                    {isOpen ? project.name : project.name.charAt(0)}
                  </div>

                  {isOpen && activeItem === project.id && activeType === "project" && (
                    <div className="item-actions">
                      <button onClick={() => onEditProject(project)} className="edit-btn">✏️</button>
                      <button onClick={() => onDeleteProject(project.id, project.name)} className="delete-btn">🗑️</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="tags-section">
          <div className="section-header">
            {isOpen ? (
              <>
                <h4
                  onClick={() => toggleSection("tags")}
                  style={{ cursor: "pointer", userSelect: "none" }}
                >
                  {tagsOpen ? "▼" : "▶"} Tags
                </h4>
                <button className="create-tag-btn" onClick={onCreateTag}>+ Novo</button>
              </>
            ) : (
              <span
                className="compact-header"
                title="Tags"
                onClick={() => toggleSection("tags")}
                style={{ cursor: "pointer" }}
              >
                🏷️
              </span>
            )}
          </div>

          {tagsOpen && (
            <div className={`tags-list ${isOpen ? "" : "compact"}`}>
              {tags.map((tag) => (
                <div key={tag.id} className="tag-wrapper">
                  <span
                    className="tag"
                    style={{
                      backgroundColor: tag.color,
                      color: getTextColor(tag.color)
                    }}
                    onClick={() => handleItemClick(tag.id, "tag")}
                    title={tag.name}
                  >
                    {isOpen ? `#${tag.name}` : tag.name.charAt(0)}
                  </span>

                  {isOpen && activeItem === tag.id && activeType === "tag" && (
                    <div className="item-actions">
                      <button onClick={() => onEditTag(tag)} className="edit-btn">✏️</button>
                      <button onClick={() => onDeleteTag(tag.id, tag.name)} className="delete-btn">🗑️</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}