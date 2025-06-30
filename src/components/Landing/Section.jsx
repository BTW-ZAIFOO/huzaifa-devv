import React, { useRef, useEffect, useCallback } from "react";
import PropTypes from "prop-types";

const classNames = (...classes) => classes.filter(Boolean).join(" ");

const Section = ({ title, children, id, className = "" }) => {
  const ref = useRef(null);

  const handleScroll = useCallback(() => {
    const el = ref.current;
    if (!el) return;
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
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.add("opacity-0", "translate-y-8");
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <section
      id={id}
      ref={ref}
      className={classNames(
        "py-16 px-4 max-w-7xl mx-auto opacity-0 translate-y-8 font-sans",
        className
      )}
      tabIndex={-1}
      aria-labelledby={id ? `${id}-title` : undefined}
    >
      {title && (
        <h2
          id={id ? `${id}-title` : undefined}
          className="text-4xl md:text-5xl font-extrabold mb-12 text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 tracking-tight transition-colors duration-500 font-sans drop-shadow-lg"
        >
          {title}
        </h2>
      )}
      {children}
    </section>
  );
};

Section.propTypes = {
  title: PropTypes.node,
  children: PropTypes.node,
  id: PropTypes.string,
  className: PropTypes.string,
};

export default Section;
