import { useState } from "react";
import "../styles/Sidebar.css";

export default function Sidebar({
  projects = [],
  tags = [],
  onSelectProject,
  onCreateProject,
  onCreateTag,
  onLogout
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={`sidebar ${isOpen ? "open" : "collapsed"}`}>
      <div className="sidebar-header">
        <button className="menu-btn" onClick={() => setIsOpen(!isOpen)}>
          ☰
        </button>
        {isOpen && <h2 className="sidebar-title">Perfil</h2>}
        {isOpen && (
          <button className="logout-btn-sidebar" onClick={onLogout}>
            Sair
          </button>
        )}
      </div>

      {isOpen && (
        <div className="sidebar-content">
          <button className="new-project-btn" onClick={onCreateProject}>
            + Novo Projeto
          </button>

          <div className="projects-list">
            {projects.map(project => (
              <div
                key={project.id}
                className="project-item"
                onClick={() => onSelectProject(project.name)}
              >
                <span className="project-name">{project.name}</span>
              </div>
            ))}
          </div>

          <div className="tags-section">
            <h4>Tags</h4>
            <div className="tags-list">
              {tags.map(tag => (
                <span key={tag.id} className="tag" style={{ backgroundColor: tag.color }}>
                  #{tag.name}
                </span>
              ))}
            </div>
          </div>

          <button className="create-tag-btn" onClick={onCreateTag}>
            + Criar Tag
          </button>
        </div>
      )}
    </div>
  );
}