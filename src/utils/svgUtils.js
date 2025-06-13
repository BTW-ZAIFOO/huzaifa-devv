/**
 * Helper functions to fix SVG attribute issues
 */

/**
 * Ensures SVG attributes are proper values rather than "inherit"
 * @param {Object} props - The component props
 * @returns {Object} Fixed props
 */
export const fixSvgAttributes = (props) => {
  const fixedProps = { ...props };

  // Replace "inherit" with proper default values
  if (fixedProps.width === "inherit") fixedProps.width = "1em";
  if (fixedProps.height === "inherit") fixedProps.height = "1em";

  return fixedProps;
};

/**
 * SVG wrapper component that ensures proper attributes
 */
export const SafeSvg = ({ children, ...props }) => {
  const fixedProps = fixSvgAttributes(props);
  return <svg {...fixedProps}>{children}</svg>;
};
