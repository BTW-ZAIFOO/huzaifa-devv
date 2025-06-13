export const fixSvgAttributes = (props) => {
  const fixedProps = { ...props };

  if (fixedProps.width === "inherit") fixedProps.width = "1em";
  if (fixedProps.height === "inherit") fixedProps.height = "1em";

  return fixedProps;
};

export const SafeSvg = ({ children, ...props }) => {
  const fixedProps = fixSvgAttributes(props);
  return <svg {...fixedProps}>{children}</svg>;
};
