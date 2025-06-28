import React from "react";
import PropTypes from "prop-types";
import Section from "./Section";

const RESOURCES = [
  { title: "2024 Trust & Safety Report", link: "#", type: "Whitepaper" },
  { title: "AI Moderation Best Practices", link: "#", type: "Blog" },
  { title: "Webinar: Scaling Compliance", link: "#", type: "Webinar" },
];

const ResourceCard = ({ title, link, type }) => (
  <div>
    <a
      href={link}
      className="hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group"
      aria-label={title}
      {...(link !== "#" && { target: "_blank", rel: "noopener noreferrer" })}
    >
      <div className="text-indigo-700 text-center font-bold mb-2">{type}</div>
      <div className="text-lg font-semibold text-center group-hover:text-blue-700">
        {title}
      </div>
    </a>
  </div>
);

ResourceCard.propTypes = {
  title: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
};

const ResourcesSection = () => (
  <Section id="resources">
    <h1 className="text-5xl font-extrabold pb-12 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 font-sans drop-shadow-lg">
      Resources & Insights
    </h1>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {RESOURCES.map(({ title, link, type }, i) => (
        <ResourceCard key={i} title={title} link={link} type={type} />
      ))}
    </div>
  </Section>
);

export default ResourcesSection;
