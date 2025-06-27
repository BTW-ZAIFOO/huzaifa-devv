import React from "react";
import PropTypes from "prop-types";

const capabilities = [
  {
    key: "Universal Accessibility",
    title: "Universal Accessibility",
    description:
      "Designed for inclusivity, ensuring every voice is heard and respected.",
    aosDelay: 100,
  },
  {
    key: "Intelligent Moderation Suite",
    title: "Intelligent Moderation Suite",
    description:
      "Real-time intervention, escalation, and analytics for proactive management.",
    aosDelay: 250,
  },
  {
    key: "Executive Reporting",
    title: "Executive Reporting",
    description:
      "Instantly generate compliance, risk, and engagement reports for stakeholders.",
    aosDelay: 400,
  },
];

const PlatformCapabilitiesSection = ({ SectionIcons }) => (
  <section className="mb-16">
    <h3
      className="text-2xl font-bold text-indigo-700 mb-6 transition-all duration-700"
      data-aos="fade-left"
    >
      Platform Capabilities
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
      {capabilities.map(({ key, title, description, aosDelay }) => (
        <div
          key={key}
          data-aos="fade-up"
          data-aos-delay={aosDelay}
          className="transition-all duration-700"
        >
          {SectionIcons[key]}
          <h4 className="font-bold mb-2">{title}</h4>
          <p className="text-gray-600">{description}</p>
        </div>
      ))}
    </div>
  </section>
);

PlatformCapabilitiesSection.propTypes = {
  SectionIcons: PropTypes.objectOf(PropTypes.node).isRequired,
};

export default PlatformCapabilitiesSection;
