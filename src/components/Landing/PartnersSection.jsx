import React from "react";
import { FaMicrosoft, FaSlack, FaSalesforce } from "react-icons/fa";
import Section from "./Section";

const PARTNERS = [
  {
    name: "Microsoft",
    icon: (
      <FaMicrosoft className="text-blue-700 text-4xl" aria-label="Microsoft" />
    ),
  },
  {
    name: "Slack",
    icon: <FaSlack className="text-indigo-600 text-4xl" aria-label="Slack" />,
  },
  {
    name: "Salesforce",
    icon: (
      <FaSalesforce
        className="text-blue-400 text-4xl"
        aria-label="Salesforce"
      />
    ),
  },
];

const PartnersSection = () => (
  <Section
    title="Our Trusted Partners"
    id="partners"
    className="bg-white/60 rounded-2xl shadow-lg my-16"
  >
    <div className="flex flex-wrap justify-center items-center gap-10">
      {PARTNERS.map(({ name, icon }) => (
        <figure key={name} className="flex flex-col items-center">
          {icon}
          <figcaption className="mt-2 text-sm text-gray-600">{name}</figcaption>
        </figure>
      ))}
    </div>
  </Section>
);

PartnersSection.propTypes = {};

export default PartnersSection;
