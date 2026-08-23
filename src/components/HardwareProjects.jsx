import React from "react";
import "../styles/Projects.css";
import "../styles/HardwareProjects.css";
import FolderOpenRoundedIcon from "@mui/icons-material/FolderOpenRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import FadeInSection from "./FadeInSection";
import { useNavigate } from "react-router-dom";

const hardwareProjects = {
  "Mystery Build #1": {
    desc: "A hands-on project is on its way. Parts have allegedly been ordered.",
    techStack: "Coming soon",
  },
  "Mystery Build #2": {
    desc: "This slot is reserved for the second great tinkering adventure.",
    techStack: "In the works",
  },
};

const HardwareProjects = () => {
  const navigate = useNavigate();

  return (
    <div id="hardware-projects">
      <div className="section-header">
        <span className="section-title">/ hardware</span>
      </div>
      <div className="project-container">
        <ul className="projects-grid">
          {Object.keys(hardwareProjects).map((key, i) => {
            const project = hardwareProjects[key];
            return (
              <FadeInSection key={i} delay={(i + 1) * 100 + "ms"}>
                <li
                  className={`projects-card ${project.image ? "transparent-card" : ""}`}
                  onClick={() => project.link && navigate(project.link)}
                >
                  {project.image ? (
                    <div className="project-image-container">
                      <img src={project.image} alt={key} className="project-image" style={project.imageStyle || {}} />
                    </div>
                  ) : (
                    <div className="card-header">
                      <div className="folder-icon">
                        <FolderOpenRoundedIcon sx={{ fontSize: 35 }} />
                      </div>
                    </div>
                  )}
                  <div className="card-title">{key}</div>
                  {project.badge && (
                    <a
                      href={project.badge.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="card-badge-link"
                      onClick={e => e.stopPropagation()}
                    >
                      {project.badge.text}
                      <OpenInNewRoundedIcon sx={{ fontSize: 12, display: "block" }} />
                    </a>
                  )}
                  <div className="card-desc">{project.desc}</div>
                  {project.link && (
                    <div className="full-log-link">Full project log</div>
                  )}
                  <div className="card-tech">{project.techStack}</div>
                </li>
              </FadeInSection>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default HardwareProjects;
