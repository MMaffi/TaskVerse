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

  const handleItemClick = (id, type) => {
    // Se a sidebar estiver minimizada, abre
    if (!isOpen) setIsOpen(true);

    if (activeItem === id && activeType === type) {
      setActiveItem(null);
      setActiveType(null);
    } else {
      setActiveItem(id);
      setActiveType(type);
    }
  };

  // Listener para Ctrl + B
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === "b") {
        e.preventDefault(); // evita comportamentos do browser
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
                <h4>Projetos</h4>
                <button className="new-project-btn" onClick={onCreateProject}>+ Novo</button>
              </>
            ) : (
              <span className="compact-header" title="Projetos">📁</span>
            )}
          </div>
          <div className={`projects-list ${isOpen ? "" : "compact"}`}>
            {projects.map(project => (
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
        </div>

        {/* Tags */}
        <div className="tags-section">
          <div className="section-header">
            {isOpen ? (
              <>
                <h4>Tags</h4>
                <button className="create-tag-btn" onClick={onCreateTag}>+ Novo</button>
              </>
            ) : (
              <span className="compact-header" title="Tags">🏷️</span>
            )}
          </div>
          <div className={`tags-list ${isOpen ? "" : "compact"}`}>
            {tags.map(tag => (
              <div key={tag.id} className="tag-wrapper">
                <span
                  className="tag"
                  style={{ backgroundColor: tag.color }}
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
        </div>
      </div>
    </div>
  );
}