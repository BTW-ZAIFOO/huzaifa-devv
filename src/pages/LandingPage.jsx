import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FaMicrosoft,
  FaSlack,
  FaSalesforce,
  FaBrain,
  FaGlobe,
  FaUserShield,
  FaUniversalAccess,
  FaTools,
  FaFileAlt,
  FaShieldAlt,
  FaRobot,
  FaMobileAlt,
  FaHospital,
  FaUniversity,
  FaBriefcase,
  FaUsers,
  FaArrowUp,
  FaLinkedin,
  FaTwitter,
  FaGithub,
} from "react-icons/fa";

const ANNOUNCEMENT =
  "🚀 New: AIChatBOT is now SOC 2 Type II Certified! Learn more.";
const PARTNERS = [
  {
    name: "Microsoft",
    icon: <FaMicrosoft className="text-blue-700 text-4xl" />,
  },
  { name: "Slack", icon: <FaSlack className="text-indigo-600 text-4xl" /> },
  {
    name: "Salesforce",
    icon: <FaSalesforce className="text-blue-400 text-4xl" />,
  },
];

const RESOURCES = [
  { title: "2024 Trust & Safety Report", link: "#", type: "Whitepaper" },
  { title: "AI Moderation Best Practices", link: "#", type: "Blog" },
  { title: "Webinar: Scaling Compliance", link: "#", type: "Webinar" },
];

const SOCIALS = [
  { icon: <FaLinkedin />, label: "LinkedIn", url: "https://linkedin.com" },
  { icon: <FaTwitter />, label: "Twitter", url: "https://twitter.com" },
  { icon: <FaGithub />, label: "GitHub", url: "https://github.com" },
];

const NAV_ITEMS = [
  { label: "Home", id: "hero" },
  { label: "Why Us", id: "why-us" },
  { label: "Solutions", id: "solutions" },
  { label: "Industries", id: "industries" },
  { label: "Integration", id: "integration" },
  { label: "Contact", id: "contact" },
];

const scrollToSection = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
};

const ANNOUNCEMENT_HEIGHT = 40;

const AnnouncementBar = () => (
  <div
    className="w-full bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-white text-center py-2 px-4 text-base font-bold fixed top-0 left-0 z-[60] shadow-lg tracking-wide animate-gradient-x"
    style={{ minHeight: ANNOUNCEMENT_HEIGHT }}
    aria-label="Announcement"
  >
    <span role="status" aria-live="polite">
      {ANNOUNCEMENT}
    </span>
  </div>
);

const Navbar = () => {
  const [active, setActive] = useState("");
  useEffect(() => {
    const handleScroll = () => {
      let found = "";
      for (const item of NAV_ITEMS) {
        const el = document.getElementById(item.id);
        if (el && window.scrollY + 120 >= el.offsetTop) found = item.id;
      }
      setActive(found);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (id) => {
    setActive(id);
    scrollToSection(id);
  };

  return (
    <nav
      className="fixed left-0 w-full z-50 bg-white/90 backdrop-blur-lg border-b border-blue-100 shadow-lg transition-all"
      style={{ top: ANNOUNCEMENT_HEIGHT }}
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3 bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 rounded-full px-5 py-2 shadow-lg border border-blue-200 animate-fadeIn">
          <span className="text-2xl font-extrabold text-blue-800 tracking-tight select-none font-sans flex items-center gap-2">
            <span className="animate-bounce">🤖</span> AIChatBOT
          </span>
        </div>
        <div className="flex-1 flex justify-center">
          <div className="flex gap-2 items-center">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`relative px-3 py-2 text-blue-800 font-semibold whitespace-nowrap transition-all duration-200
                  hover:text-indigo-700 hover:scale-110
                  ${active === item.id ? "text-indigo-700 scale-110" : ""}
                  font-sans
                `}
                aria-current={active === item.id ? "page" : undefined}
                style={{ fontSize: "1.05rem" }}
              >
                <span className="relative z-999">{item.label}</span>
                <span
                  className={`absolute left-2 right-2 -bottom-1 h-[3px] rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300
                    ${
                      active === item.id
                        ? "opacity-100 scale-x-100"
                        : "opacity-0 scale-x-0"
                    }
                  `}
                  style={{ transformOrigin: "center" }}
                />
              </button>
            ))}
          </div>
        </div>
        <Link
          to="/chat"
          className="ml-4 px-6 py-2 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-white rounded-full font-bold shadow-lg hover:scale-110 hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 font-sans border-2 border-indigo-200"
          style={{ fontSize: "1.05rem" }}
        >
          🚀 Request Demo
        </Link>
      </div>
    </nav>
  );
};

const Section = ({ title, children, id, className = "" }) => {
  const ref = useRef();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.add("opacity-0", "translate-y-8");
    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 100) {
        el.classList.remove("opacity-0", "translate-y-8");
        el.classList.add(
          "transition-all",
          "duration-700",
          "opacity-100",
          "translate-y-0"
        );
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <section
      id={id}
      ref={ref}
      className={`py-20 px-4 max-w-7xl mx-auto scroll-mt-32 opacity-0 translate-y-8 ${className} font-sans`}
      tabIndex={-1}
      aria-labelledby={id + "-title"}
    >
      {title && (
        <h2
          id={id + "-title"}
          className="text-4xl md:text-5xl font-extrabold mb-12 text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 tracking-tight transition-colors duration-500 font-sans drop-shadow-lg"
        >
          {title}
        </h2>
      )}
      {children}
    </section>
  );
};

const HeroSection = () => {
  const ref = useRef();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.add("opacity-0", "translate-y-8");
    setTimeout(() => {
      el.classList.remove("opacity-0", "translate-y-8");
      el.classList.add(
        "transition-all",
        "duration-1000",
        "opacity-100",
        "translate-y-0"
      );
    }, 200);
  }, []);
  return (
    <section
      id="hero"
      ref={ref}
      className="relative flex flex-col md:flex-row items-center justify-between px-8 py-36 md:py-48 bg-gradient-to-br from-blue-200 via-indigo-100 to-purple-100 shadow-2xl rounded-b-[4rem] opacity-0 translate-y-8 font-sans overflow-hidden"
    >
      <div className="max-w-2xl z-10">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-6xl md:text-7xl animate-bounce drop-shadow-lg">
            🤖
          </span>
          <span className="text-indigo-700 font-extrabold text-xl md:text-2xl tracking-widest uppercase bg-indigo-100 px-5 py-2 rounded-full shadow-lg border border-indigo-200 animate-pulse">
            AI Powered
          </span>
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold mb-10 text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 leading-tight transition-all duration-700 font-sans drop-shadow-2xl">
          <span className="block">Unleash</span>
          <span className="block">the Power of</span>
          <span className="block text-indigo-700">AI Chat Moderation</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-700 mb-12 font-normal transition-all duration-700 font-sans max-w-xl drop-shadow">
          <span className="font-semibold text-blue-700">Real-time</span>,{" "}
          <span className="font-semibold text-indigo-700">intelligent</span>,
          and <span className="font-semibold text-purple-700">inclusive</span>{" "}
          chat moderation for communities, businesses, and classrooms.{" "}
          <span className="text-indigo-700 font-semibold">
            Safe. Smart. Scalable.
          </span>
        </p>
        <div className="mb-12 flex flex-wrap gap-4">
          <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-6 py-3 rounded-full font-bold text-base shadow-lg font-sans border border-blue-200 animate-fadeIn">
            <FaShieldAlt className="text-blue-600" /> Trust & Safety
          </span>
          <span className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-6 py-3 rounded-full font-bold text-base shadow-lg font-sans border border-purple-200 animate-fadeIn">
            <FaUniversalAccess className="text-purple-600" /> Accessibility
          </span>
          <span className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-6 py-3 rounded-full font-bold text-base shadow-lg font-sans border border-indigo-200 animate-fadeIn">
            <FaRobot className="text-indigo-600" /> Smart Automation
          </span>
        </div>
        <Link
          to="/chat"
          className="inline-block px-14 py-5 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-white rounded-2xl font-extrabold text-2xl shadow-2xl hover:scale-110 hover:shadow-2xl transition-transform duration-300 font-sans tracking-wide border-2 border-indigo-200 animate-bounce"
        >
          🚀 Start Chatting Now
        </Link>
        <div className="mt-10 flex gap-6">
          <span className="text-gray-500 text-base flex items-center gap-2 font-semibold">
            <span className="animate-pulse text-green-500">●</span> 24/7 AI
            Moderation
          </span>
          <span className="text-gray-500 text-base flex items-center gap-2 font-semibold">
            <span className="animate-pulse text-blue-400">●</span> Free Demo
            Available
          </span>
        </div>
      </div>
      <div className="relative mt-24 md:mt-0 md:ml-16 flex items-center justify-center z-10">
        <span
          className="text-[10rem] md:text-[14rem] select-none animate-float drop-shadow-xl"
          role="img"
          aria-label="chatbot"
        >
          💬
        </span>
        <span className="absolute top-4 left-4 text-5xl animate-spin-slow opacity-30">
          🛡️
        </span>
        <span className="absolute bottom-6 right-6 text-5xl animate-pulse opacity-30">
          ✨
        </span>
        <span className="absolute top-16 right-10 w-40 h-40 bg-indigo-100 rounded-full blur-2xl opacity-40"></span>
        <span className="absolute bottom-10 left-10 w-32 h-32 bg-blue-200 rounded-full blur-2xl opacity-30"></span>
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-gradient-to-br from-blue-200 via-indigo-100 to-purple-100 rounded-full blur-3xl opacity-20 pointer-events-none"></span>
      </div>
      <div className="absolute -top-32 -left-32 w-[32rem] h-[32rem] bg-gradient-to-br from-blue-300 via-indigo-200 to-purple-200 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-[32rem] h-[32rem] bg-gradient-to-tr from-purple-200 via-blue-100 to-indigo-100 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
      <span className="absolute top-16 left-1/2 -translate-x-1/2 text-3xl animate-bounce opacity-40">
        ✨
      </span>
      <span className="absolute bottom-16 right-1/2 translate-x-1/2 text-3xl animate-bounce opacity-40">
        ✨
      </span>
    </section>
  );
};

const PartnersSection = () => (
  <Section
    title="Our Trusted Partners"
    id="partners"
    className="bg-white/60 rounded-2xl shadow-lg my-16"
  >
    <div className="flex flex-wrap justify-center items-center gap-10">
      {PARTNERS.map((p) => (
        <div key={p.name} className="flex flex-col items-center">
          {p.icon}
          <span className="mt-2 text-sm text-gray-600">{p.name}</span>
        </div>
      ))}
    </div>
  </Section>
);

const SectionIcons = {
  "Cutting-Edge AI": (
    <FaBrain className="text-blue-700 text-4xl mb-4 mx-auto" />
  ),
  "Global Scalability": (
    <FaGlobe className="text-indigo-700 text-4xl mb-4 mx-auto" />
  ),
  "Compliance Leadership": (
    <FaUserShield className="text-purple-700 text-4xl mb-4 mx-auto" />
  ),
  "Universal Accessibility": (
    <FaUniversalAccess className="text-blue-700 text-4xl mb-3 mx-auto" />
  ),
  "Intelligent Moderation Suite": (
    <FaTools className="text-indigo-700 text-4xl mb-3 mx-auto" />
  ),
  "Executive Reporting": (
    <FaFileAlt className="text-purple-700 text-4xl mb-3 mx-auto" />
  ),
  "AI-Driven Risk Audit": (
    <FaShieldAlt className="text-blue-700 text-4xl mb-3 mx-auto" />
  ),
  "Chatbot Remediation": (
    <FaRobot className="text-indigo-700 text-4xl mb-3 mx-auto" />
  ),
  "Omnichannel Monitoring": (
    <FaMobileAlt className="text-purple-700 text-4xl mb-3 mx-auto" />
  ),
  Healthcare: <FaHospital className="text-blue-700 text-3xl mb-3 mx-auto" />,
  Education: <FaUniversity className="text-indigo-700 text-3xl mb-3 mx-auto" />,
  Enterprise: <FaBriefcase className="text-purple-700 text-3xl mb-3 mx-auto" />,
  Communities: <FaUsers className="text-pink-700 text-3xl mb-3 mx-auto" />,
};

const Footer = () => (
  <footer className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-white py-12 mt-24 shadow-inner">
    <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
      <div className="flex flex-col items-center md:items-start gap-2">
        <div className="flex items-center gap-2">
          <span className="text-3xl animate-bounce">🤖</span>
          <span className="text-2xl font-extrabold tracking-tight">
            AIChatBOT
          </span>
        </div>
        <span className="text-base font-medium text-indigo-100">
          Leading the Future of Safe Digital Communication
        </span>
      </div>
      <div className="flex flex-col md:flex-row gap-6 items-center">
        <div className="flex gap-6">
          <Link
            to="#hero"
            className="hover:underline hover:text-yellow-200 transition"
          >
            Home
          </Link>
          <Link
            to="#why-us"
            className="hover:underline hover:text-yellow-200 transition"
          >
            Why Us
          </Link>
          <Link
            to="#solutions"
            className="hover:underline hover:text-yellow-200 transition"
          >
            Solutions
          </Link>
          <Link
            to="#industries"
            className="hover:underline hover:text-yellow-200 transition"
          >
            Industries
          </Link>
          <Link
            to="#integration"
            className="hover:underline hover:text-yellow-200 transition"
          >
            Integration
          </Link>
          <Link
            to="#contact"
            className="hover:underline hover:text-yellow-200 transition"
          >
            Contact
          </Link>
        </div>
        <div className="flex gap-4 mt-4 md:mt-0">
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className="text-2xl hover:text-yellow-300 transition-colors duration-200"
            >
              {s.icon}
            </a>
          ))}
        </div>
      </div>
    </div>
    <div className="mt-8 text-center text-indigo-100 text-sm font-medium tracking-wide">
      &copy; {new Date().getFullYear()} AIChatBOT. All rights reserved.
    </div>
  </footer>
);

const ScrollToTop = () => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return show ? (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-8 right-8 z-50 bg-blue-700 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 transition"
      aria-label="Scroll to top"
    >
      <FaArrowUp />
    </button>
  ) : null;
};

const ResourcesSection = () => (
  <Section
    title="Resources & Insights"
    id="resources"
    className="bg-white/60 rounded-2xl shadow-lg my-16"
  >
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {RESOURCES.map((r, i) => (
        <a
          key={i}
          href={r.link}
          className="block bg-white rounded-xl shadow p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group"
          aria-label={r.title}
        >
          <div className="text-indigo-700 font-bold mb-2">{r.type}</div>
          <div className="text-lg font-semibold group-hover:text-blue-700">
            {r.title}
          </div>
        </a>
      ))}
    </div>
  </Section>
);

const LandingPage = () => (
  <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen font-sans">
    <AnnouncementBar />
    <Navbar />
    <div className="pt-[80px] md:pt-[88px]">
      <HeroSection />
      <Section
        title="Why Leading Organizations Choose AIChatBOT"
        id="why-us"
        className="bg-white/60 rounded-2xl shadow-lg my-16"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          <div>
            {SectionIcons["Cutting-Edge AI"]}
            <h4 className="font-bold mb-2">Cutting-Edge AI</h4>
            <p className="text-gray-600">
              Proprietary algorithms deliver unmatched accuracy in detecting and
              remediating risks.
            </p>
          </div>
          <div>
            {SectionIcons["Global Scalability"]}
            <h4 className="font-bold mb-2">Global Scalability</h4>
            <p className="text-gray-600">
              Enterprise-grade infrastructure supports millions of users
              worldwide, 24/7.
            </p>
          </div>
          <div>
            {SectionIcons["Compliance Leadership"]}
            <h4 className="font-bold mb-2">Compliance Leadership</h4>
            <p className="text-gray-600">
              Stay ahead of evolving regulations with automated compliance and
              reporting.
            </p>
          </div>
        </div>
      </Section>
      <Section title="Our Solutions" id="solutions" className="my-16">
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-blue-700 mb-6">
            Moderation Framework
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 text-center">
            <div>
              <div className="text-5xl text-blue-700 mb-3 font-extrabold">
                01
              </div>
              <h3 className="font-semibold mb-2">Strategic Audit</h3>
              <p className="text-gray-600">
                Comprehensive assessment of your digital ecosystem for risk and
                opportunity.
              </p>
            </div>
            <div>
              <div className="text-5xl text-indigo-700 mb-3 font-extrabold">
                02
              </div>
              <h3 className="font-semibold mb-2">Deep AI Analysis</h3>
              <p className="text-gray-600">
                Advanced NLP and ML models surface actionable insights in real
                time.
              </p>
            </div>
            <div>
              <div className="text-5xl text-purple-700 mb-3 font-extrabold">
                03
              </div>
              <h3 className="font-semibold mb-2">Seamless Integration</h3>
              <p className="text-gray-600">
                Effortless deployment across your platforms with robust APIs.
              </p>
            </div>
            <div>
              <div className="text-5xl text-pink-700 mb-3 font-extrabold">
                04
              </div>
              <h3 className="font-semibold mb-2">Continuous Impact</h3>
              <p className="text-gray-600">
                Ongoing monitoring, reporting, and optimization for lasting
                results.
              </p>
            </div>
          </div>
        </div>
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-indigo-700 mb-6">
            Platform Capabilities
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            <div>
              {SectionIcons["Universal Accessibility"]}
              <h4 className="font-bold mb-2">Universal Accessibility</h4>
              <p className="text-gray-600">
                Designed for inclusivity, ensuring every voice is heard and
                respected.
              </p>
            </div>
            <div>
              {SectionIcons["Intelligent Moderation Suite"]}
              <h4 className="font-bold mb-2">Intelligent Moderation Suite</h4>
              <p className="text-gray-600">
                Real-time intervention, escalation, and analytics for proactive
                management.
              </p>
            </div>
            <div>
              {SectionIcons["Executive Reporting"]}
              <h4 className="font-bold mb-2">Executive Reporting</h4>
              <p className="text-gray-600">
                Instantly generate compliance, risk, and engagement reports for
                stakeholders.
              </p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-purple-700 mb-6">
            Comprehensive Solutions Suite
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            <div>
              {SectionIcons["AI-Driven Risk Audit"]}
              <h4 className="font-bold mb-2">AI-Driven Risk Audit</h4>
              <p className="text-gray-600">
                Automated, adaptive moderation and threat detection at scale.
              </p>
            </div>
            <div>
              {SectionIcons["Chatbot Remediation"]}
              <h4 className="font-bold mb-2">Chatbot Remediation</h4>
              <p className="text-gray-600">
                Instant, intelligent resolution of flagged issues.
              </p>
            </div>
            <div>
              {SectionIcons["Omnichannel Monitoring"]}
              <h4 className="font-bold mb-2">Omnichannel Monitoring</h4>
              <p className="text-gray-600">
                Unified oversight across web, mobile, and enterprise platforms.
              </p>
            </div>
          </div>
        </div>
      </Section>
      <Section
        title="Industries We Serve"
        id="industries"
        className="bg-white/60 rounded-2xl shadow-lg my-16"
      >
        <div className="flex flex-wrap justify-center gap-10">
          <div className="bg-white rounded-2xl shadow-lg p-8 w-64 text-center">
            {SectionIcons["Healthcare"]}
            <h5 className="font-bold mb-2">Healthcare</h5>
            <p className="text-gray-600 text-base">
              Secure, HIPAA-compliant patient and provider communication.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8 w-64 text-center">
            {SectionIcons["Education"]}
            <h5 className="font-bold mb-2">Education</h5>
            <p className="text-gray-600 text-base">
              Safe, moderated learning environments for students and faculty.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8 w-64 text-center">
            {SectionIcons["Enterprise"]}
            <h5 className="font-bold mb-2">Enterprise</h5>
            <p className="text-gray-600 text-base">
              Secure, compliant collaboration for global teams.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8 w-64 text-center">
            {SectionIcons["Communities"]}
            <h5 className="font-bold mb-2">Communities</h5>
            <p className="text-gray-600 text-base">
              Foster trust and inclusion in public and private forums.
            </p>
          </div>
        </div>
      </Section>
      <Section
        title="Integration & Resources"
        id="integration"
        className="my-16"
      >
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-blue-700 mb-4">
            Seamless Integration & Customization
          </h3>
          <ul className="list-disc list-inside text-gray-700 mb-6 text-lg">
            <li>Plug-and-play with leading CMS and collaboration platforms</li>
            <li>Accessible, intuitive interfaces for all user types</li>
            <li>Multi-platform, multi-language support</li>
            <li>Fully customizable to your brand and workflow</li>
          </ul>
          <Link
            to="/chat"
            className="inline-block px-8 py-3 bg-blue-700 text-white rounded-xl font-bold shadow hover:bg-blue-800"
          >
            Connect with Our Experts
          </Link>
        </div>
        <PartnersSection />
        <ResourcesSection />
      </Section>
      <Section
        title="Testimonials"
        id="testimonials"
        className="bg-white/60 rounded-2xl shadow-lg my-16"
      >
        <div className="flex flex-wrap justify-center gap-10">
          <div className="bg-white rounded-2xl shadow-lg p-8 w-96 text-center">
            <span className="text-5xl mb-4 block" role="img" aria-label="user">
              🧑‍💼
            </span>
            <h5 className="font-bold mb-2">Alexis Roy, CTO</h5>
            <p className="text-gray-600 text-base mb-2">
              "AIChatBOT has set a new standard for digital trust and safety.
              Our user engagement and compliance scores have never been higher."
            </p>
          </div>
        </div>
      </Section>
      <Section title="Contact & FAQs" id="contact" className="my-16">
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-blue-700 mb-4">
            Frequently Asked Questions
          </h3>
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto mb-8">
            <h4 className="font-bold mb-4">What makes AIChatBOT unique?</h4>
            <p className="text-gray-600 mb-6">
              Our platform combines state-of-the-art AI, enterprise-grade
              security, and regulatory expertise to deliver unmatched moderation
              outcomes.
            </p>
            <h4 className="font-bold mb-4">How do I get started?</h4>
            <p className="text-gray-600 mb-6">
              Schedule a live demo or connect with our team to discuss your
              organization's needs.
            </p>
          </div>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-blue-700 mb-4">
            Connect with Our Team
          </h3>
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
            <form>
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full px-5 py-3 border border-gray-300 rounded-xl mb-3 text-lg"
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  className="w-full px-5 py-3 border border-gray-300 rounded-xl mb-3 text-lg"
                />
                <textarea
                  placeholder="Your Message"
                  className="w-full px-5 py-3 border border-gray-300 rounded-xl text-lg"
                  rows={5}
                />
              </div>
              <button
                type="submit"
                className="px-10 py-3 bg-blue-700 text-white rounded-xl font-bold shadow hover:bg-blue-800"
              >
                Submit Inquiry
              </button>
            </form>
          </div>
        </div>
      </Section>
      <Footer />
    </div>
    <ScrollToTop />
    <Link
      to="/chat"
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 px-8 py-3 bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-full font-bold shadow-lg hover:scale-105 hover:shadow-2xl transition-transform duration-300 hidden md:block"
      style={{ minWidth: 220, textAlign: "center" }}
      aria-label="Request your demo now"
    >
      Request Your Demo Now
    </Link>
  </div>
);

export default LandingPage;
