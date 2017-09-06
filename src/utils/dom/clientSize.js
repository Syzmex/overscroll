
export const getClientSize = ({ win, html }) => () => {
  const width = win.innerWidth || html.clientWidth;
  const height = win.innerHeight || html.clientHeight;
  return { width, height };
};
