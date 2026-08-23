import React from "react";
import "../styles/About.css";
import FadeInSection from "./FadeInSection";

const About = () => {
  const one = (
    <p>
      I am currently an <b>MBA student</b> at the
      <a href="https://www.isb.edu/"> Indian School of Business</a>, where I
      help strategize a multitude of stuff. Previously, I was at{" "}
      <a href="https://www.practo.com/"> Practo</a>,{" "}
      <a href="https://www.zs.com/"> ZS</a>,{" "}
      <a href="https://www.crisil.com/"> Crisil</a> and{" "}
      <a href="https://www.tatapower.com/"> Tata Power.</a>
    </p>
  );
  const two = (
    <p>
      In my free time, I love obsessing over newly tried sports, watching
      movies and documentaries, and missing home. Oh, I started learning how
      to build with Claude Code too.
    </p>
  );

  const techStack = [
    "Strategy Lead, Women in Business @ ISB",
    "CEO's Office Intern @ Practo",
    "Live Project @ Zaggle",
    "Marketing @ Apollo 24/7",
    "Academic Representative, GSB Core",
  ];

  return (
    <div id="about">
      <FadeInSection>
        <div className="section-header ">
          <span className="section-title">/ about me</span>
        </div>
        <div className="about-content">
          <div className="about-description">
            {one}
            {"Here are some of my recent engagements:"}
            <ul className="tech-stack">
              {techStack.map((techItem, i) => (
                <FadeInSection key={i} delay={(i + 1) * 100 + "ms"}>
                  <li>{techItem}</li>
                </FadeInSection>
              ))}
            </ul>
            {two}
          </div>
          <div className="about-image">
            <img alt="Tanishq Sachdeva" src={"/assets/me2.jpg"} />
          </div>
        </div>
      </FadeInSection>
    </div>
  );
};

export default About;
