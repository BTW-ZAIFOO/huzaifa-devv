import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";

const NAV_ITEMS = [
  { label: "Home", id: "hero" },
  { label: "Why Us", id: "why-us" },
  { label: "Solutions", id: "solutions" },
  { label: "Industries", id: "industries" },
  { label: "Integration", id: "integration" },
  { label: "Contact", id: "contact" },
];

const ANNOUNCEMENT_HEIGHT = 40;

const scrollToSection = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
};

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

  const handleNavClick = useCallback(
    (id) => {
      setActive(id);
      scrollToSection(id);
    },
    [setActive]
  );

  return (
    <nav
      className="fixed left-0 w-full z-50 bg-white/90 backdrop-blur-lg border-b border-blue-100 shadow-lg transition-all"
      style={{ top: ANNOUNCEMENT_HEIGHT }}
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3 bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 rounded-full px-5 py-2 shadow-lg border border-blue-200 animate-fadeIn">
          <span className="text-2xl font-extrabold text-blue-800 tracking-tight select-none font-sans flex items-center gap-2">
            <span role="img" aria-label="robot">
              🤖
            </span>
            // AICHATBOT //
          </span>
        </div>
        <div className="flex-1 flex justify-center">
          <ul className="flex gap-2 items-center" role="menubar">
            {NAV_ITEMS.map((item) => (
              <li key={item.id} role="none">
                <button
                  onClick={() => handleNavClick(item.id)}
                  className={`relative px-3 py-2 text-blue-800 font-semibold whitespace-nowrap transition-all duration-200
                    hover:text-indigo-700 hover:scale-110
                    ${active === item.id ? "text-indigo-700 scale-110" : ""}
                    font-sans
                  `}
                  aria-current={active === item.id ? "page" : undefined}
                  style={{ fontSize: "1.05rem" }}
                  role="menuitem"
                >
                  <span className="relative z-10">{item.label}</span>
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
              </li>
            ))}
          </ul>
        </div>
        <Link
          to="/chat"
          className="ml-4 px-6 py-2 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-white rounded-full font-bold shadow-lg hover:scale-110 hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 font-sans border-2 border-indigo-200"
          style={{ fontSize: "1.05rem" }}
        >
          Login/Signup
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
