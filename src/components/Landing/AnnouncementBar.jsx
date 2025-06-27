import React from "react";
import PropTypes from "prop-types";

const ANNOUNCEMENT =
  "🚀 New: AIChatBOT is now SOC 2 Type II Certified! Learn more.";
const ANNOUNCEMENT_HEIGHT = 40;

const barStyles = {
  minHeight: ANNOUNCEMENT_HEIGHT,
};

const AnnouncementBar = ({ message }) => (
  <div
    className="w-full bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-white text-center py-2 px-4 text-base font-bold fixed top-0 left-0 z-[60] shadow-lg tracking-wide animate-gradient-x"
    style={barStyles}
    aria-label="Announcement"
  >
    <span role="status" aria-live="polite">
      {message}
    </span>
  </div>
);

AnnouncementBar.propTypes = {
  message: PropTypes.string,
};

AnnouncementBar.defaultProps = {
  message: ANNOUNCEMENT,
};

export default AnnouncementBar;
