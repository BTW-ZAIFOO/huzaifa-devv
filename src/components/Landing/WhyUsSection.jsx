import React from "react";
import PropTypes from "prop-types";
import Section from "./Section";

const FEATURES = [
  {
    key: "Cutting-Edge AI",
    title: "Cutting-Edge AI",
    description:
      "Proprietary algorithms deliver unmatched accuracy in detecting and remediating risks.",
    delay: 100,
  },
  {
    key: "Global Scalability",
    title: "Global Scalability",
    description:
      "Enterprise-grade infrastructure supports millions of users worldwide, 24/7.",
    delay: 250,
  },
  {
    key: "Compliance Leadership",
    title: "Compliance Leadership",
    description:
      "Stay ahead of evolving regulations with automated compliance and reporting.",
    delay: 400,
  },
];

const WhyUsSection = ({ SectionIcons }) => (
  <Section id="why-us" data-aos="fade-up">
    <h1 className="text-5xl font-extrabold pb-12 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 font-sans drop-shadow-lg">
      Why Leading Organizations Choose AICHATBOT
    </h1>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center mt-4">
      {FEATURES.map(({ key, title, description, delay }) => (
        <div
          key={key}
          data-aos="zoom-in"
          data-aos-delay={delay}
          className="transition-all duration-700"
        >
          {SectionIcons[key]}
          <h4 className="font-bold mb-2">{title}</h4>
          <p className="text-gray-600">{description}</p>
        </div>
      ))}
    </div>
  </Section>
);

WhyUsSection.propTypes = {
  SectionIcons: PropTypes.objectOf(PropTypes.node).isRequired,
};

export default WhyUsSection;
