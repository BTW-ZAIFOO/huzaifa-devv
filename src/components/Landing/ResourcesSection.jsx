import React from "react";
import PropTypes from "prop-types";
import Section from "./Section";

const RESOURCES = [
  { title: "2024 Trust & Safety Report", link: "#", type: "Whitepaper" },
  { title: "AI Moderation Best Practices", link: "#", type: "Blog" },
  { title: "Webinar: Scaling Compliance", link: "#", type: "Webinar" },
];

const ResourceCard = ({ title, link, type }) => (
  <article>
    <a
      href={link}
      className="block bg-white rounded-xl shadow p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group"
      aria-label={title}
      {...(link !== "#" && { target: "_blank", rel: "noopener noreferrer" })}
    >
      <div className="text-indigo-700 font-bold mb-2">{type}</div>
      <div className="text-lg font-semibold group-hover:text-blue-700">
        {title}
      </div>
    </a>
  </article>
);

ResourceCard.propTypes = {
  title: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
};

const ResourcesSection = () => (
  <Section
    title="Resources & Insights"
    id="resources"
    className="bg-white/60 rounded-2xl shadow-lg my-16"
  >
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {RESOURCES.map(({ title, link, type }, i) => (
        <ResourceCard key={i} title={title} link={link} type={type} />
      ))}
    </div>
  </Section>
);

export default ResourcesSection;
