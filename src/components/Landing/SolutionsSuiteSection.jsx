import React from "react";
import PropTypes from "prop-types";

const SolutionsSuiteSection = ({ SectionIcons }) => (
  <section>
    <h3
      className="text-2xl font-bold text-purple-700 mb-6 transition-all duration-700"
      data-aos="fade-right"
    >
      Comprehensive Solutions Suite
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
      <article
        data-aos="zoom-in-up"
        data-aos-delay="100"
        className="transition-all duration-700"
      >
        {SectionIcons["AI-Driven Risk Audit"]}
        <h4 className="font-bold mb-2">AI-Driven Risk Audit</h4>
        <p className="text-gray-600">
          Automated, adaptive moderation and threat detection at scale.
        </p>
      </article>
      <article
        data-aos="zoom-in-up"
        data-aos-delay="250"
        className="transition-all duration-700"
      >
        {SectionIcons["Chatbot Remediation"]}
        <h4 className="font-bold mb-2">Chatbot Remediation</h4>
        <p className="text-gray-600">
          Instant, intelligent resolution of flagged issues.
        </p>
      </article>
      <article
        data-aos="zoom-in-up"
        data-aos-delay="400"
        className="transition-all duration-700"
      >
        {SectionIcons["Omnichannel Monitoring"]}
        <h4 className="font-bold mb-2">Omnichannel Monitoring</h4>
        <p className="text-gray-600">
          Unified oversight across web, mobile, and enterprise platforms.
        </p>
      </article>
    </div>
  </section>
);

SolutionsSuiteSection.propTypes = {
  SectionIcons: PropTypes.objectOf(PropTypes.node).isRequired,
};

export default SolutionsSuiteSection;
