import React from "react";
import "../styles/Projects.css";
import FolderOpenRoundedIcon from "@mui/icons-material/FolderOpenRounded";
import FadeInSection from "./FadeInSection";
import { Carousel } from "react-bootstrap";
import ExternalLinks from "./ExternalLinks";

// Spotlight carousel is hidden while empty — add entries with title/desc/
// techStack/link/open/image to bring it back.
const spotlightProjects = {};

const projects = {
  "Coming Soon": {
    desc: "Something is brewing here. A project worth talking about will take this spot shortly.",
    techStack: "Watch this space",
  },
  "Under Construction": {
    desc: "Currently being assembled between classes, case comps, and coconut breaks.",
    techStack: "Patience, mostly",
  },
  "Placeholder No. 3": {
    desc: "Reserved for a future big idea. It knows who it is.",
    techStack: "TBD",
  },
};

const Projects = () => {
  return (
    <div id="projects">
      <div className="section-header ">
        <span className="section-title">/ software</span>
        <a
          href="https://github.com/tanishqsachdeva7042-png"
          className="explore-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          View all projects
        </a>
      </div>
      {Object.keys(spotlightProjects).length > 0 && (
        <>
          <div className="spotlight-projects-desktop">
            <Carousel interval={null}>
              {Object.keys(spotlightProjects).map((key, i) => (
                <Carousel.Item key={i}>
                  <img
                    className="d-block w-100"
                    src={spotlightProjects[key]["image"]}
                    alt={key}
                  />
                  <Carousel.Caption>
                    <h3>{spotlightProjects[key]["title"]}</h3>
                    <div>
                      {spotlightProjects[key]["desc"]}
                      <div className="techStack">
                        {spotlightProjects[key]["techStack"]}
                      </div>
                    </div>
                    <ExternalLinks
                      githubLink={spotlightProjects[key]["link"]}
                      openLink={spotlightProjects[key]["open"]}
                    />
                  </Carousel.Caption>
                </Carousel.Item>
              ))}
            </Carousel>
          </div>

          <div className="spotlight-projects-mobile">
            {Object.keys(spotlightProjects).map((key, i) => (
              <FadeInSection key={i} delay={(i + 1) * 100 + "ms"}>
                <div className="projects-card">
                  <div className="card-header">
                    <div className="folder-icon">
                      <FolderOpenRoundedIcon sx={{ fontSize: 35 }} />
                    </div>
                    <ExternalLinks
                      githubLink={spotlightProjects[key]["link"]}
                      openLink={spotlightProjects[key]["open"]}
                    />
                  </div>

                  <a
                    href={
                      spotlightProjects[key]["open"] ||
                      spotlightProjects[key]["link"]
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-card-link"
                  >
                    <div className="card-title">
                      {spotlightProjects[key]["title"]}
                    </div>
                    <div className="spotlight-mobile-image">
                      <img src={spotlightProjects[key]["image"]} alt={key} />
                    </div>
                  </a>
                  <div className="card-desc">{spotlightProjects[key]["desc"]}</div>
                  <div className="card-tech">{spotlightProjects[key]["techStack"]}</div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </>
      )}
      <div className="project-container">
        <ul className="projects-grid">
          {Object.keys(projects).map((key, i) => (
            <FadeInSection key={i} delay={(i + 1) * 100 + "ms"}>
              <li className="projects-card">
                <div className="card-header">
                  <div className="folder-icon">
                    <FolderOpenRoundedIcon sx={{ fontSize: 35 }} />
                  </div>
                  <ExternalLinks
                    githubLink={projects[key]["link"]}
                    openLink={projects[key]["open"]}
                  />
                </div>

                <div className="card-title">{key}</div>
                <div className="card-desc">{projects[key]["desc"]}</div>
                <div className="card-tech">{projects[key]["techStack"]}</div>
              </li>
            </FadeInSection>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Projects;
