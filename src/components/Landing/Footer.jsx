import React from "react";
import { Link } from "react-router-dom";
import { FaLinkedin, FaTwitter, FaGithub } from "react-icons/fa";

const SOCIAL_LINKS = [
  { icon: <FaLinkedin />, label: "LinkedIn", url: "https://linkedin.com" },
  { icon: <FaTwitter />, label: "Twitter", url: "https://twitter.com" },
  { icon: <FaGithub />, label: "GitHub", url: "https://github.com" },
];

const NAV_LINKS = [
  { to: "#hero", label: "Home" },
  { to: "#why-us", label: "Why Us" },
  { to: "#solutions", label: "Solutions" },
  { to: "#industries", label: "Industries" },
  { to: "#integration", label: "Integration" },
  { to: "#contact", label: "Contact" },
];

const Footer = () => (
  <footer className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-white py-12 mt-24 shadow-inner">
    <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
      <div className="flex flex-col items-center md:items-start gap-2">
        <div className="flex items-center gap-2">
          <span className="text-3xl" aria-label="// AICHATBOT // Logo">
            🤖
          </span>
          <span className="text-2xl font-extrabold tracking-tight">
            // AICHATBOT //
          </span>
        </div>
        <span className="text-base font-medium text-indigo-100">
          Leading the Future of Safe Digital Communication
        </span>
      </div>
      <div className="flex flex-col md:flex-row gap-6 items-center">
        <nav aria-label="Footer Navigation">
          <ul className="flex gap-6">
            {NAV_LINKS.map((nav) => (
              <li key={nav.label}>
                <Link
                  to={nav.to}
                  className="hover:underline hover:text-yellow-200 transition"
                >
                  {nav.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <ul className="flex gap-4 mt-4 md:mt-0" aria-label="Social Media Links">
          {SOCIAL_LINKS.map((social) => (
            <li key={social.label}>
              <a
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="text-2xl hover:text-yellow-300 transition-colors duration-200"
              >
                {social.icon}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
    <div className="mt-8 text-center text-indigo-100 text-sm font-medium tracking-wide">
      &copy; {new Date().getFullYear()} // AICHATBOT //. All rights reserved.
    </div>
  </footer>
);

export default Footer;
