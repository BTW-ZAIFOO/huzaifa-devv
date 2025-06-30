import React, { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaShieldAlt, FaUniversalAccess, FaRobot } from "react-icons/fa";

const badgeBase =
  "inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-base shadow-lg font-sans animate-fadeIn";
const featureBadges = [
  {
    icon: <FaShieldAlt className="text-blue-600" />,
    text: "Trust & Safety",
    className: `${badgeBase} bg-blue-100 text-blue-700 border border-blue-200`,
  },
  {
    icon: <FaUniversalAccess className="text-purple-600" />,
    text: "Accessibility",
    className: `${badgeBase} bg-purple-100 text-purple-700 border border-purple-200`,
  },
  {
    icon: <FaRobot className="text-indigo-600" />,
    text: "Smart Automation",
    className: `${badgeBase} bg-indigo-100 text-indigo-700 border border-indigo-200`,
  },
];

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
      className="relative flex flex-col md:flex-row items-center justify-between px-16 pt-44 pb-6 opacity-0 translate-y-8 font-sans overflow-hidden"
    >
      <div className="max-w-2xl z-10">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-6xl md:text-7xl drop-shadow-lg">🤖</span>
          <span className="text-indigo-700 font-extrabold text-xl md:text-2xl tracking-widest uppercase bg-indigo-100 px-5 py-2 rounded-full shadow-lg border border-indigo-200 animate-pulse">
            AI Powered
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold mb-10 text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 leading-tight transition-all duration-700 font-sans drop-shadow-2xl">
          Unleash the power of AICHATBOT
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
          {featureBadges.map((badge, idx) => (
            <span key={idx} className={badge.className}>
              {badge.icon} {badge.text}
            </span>
          ))}
        </div>
        <Link
          to="/chat"
          className="inline-block px-14 py-5 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-white rounded-2xl font-extrabold text-2xl shadow-2xl hover:scale-110 hover:shadow-2xl transition-transform duration-300 font-sans tracking-wide border-2 border-indigo-200"
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
      <div className="mt-24 md:mt-0 md:ml-16 flex items-center justify-center z-10">
        <span
          className="text-[15rem] drop-shadow-xl"
          role="img"
          aria-label="chatbot"
        >
          💬
        </span>
      </div>
    </section>
  );
};

export default HeroSection;
