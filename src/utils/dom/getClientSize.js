
export default ({ win, html, target, isPageScroll }) => () => {
  return isPageScroll ? {
    width: win.innerWidth || html.clientWidth,
    height: win.innerHeight || html.clientHeight
  } : {
    width: target.clientWidth,
    height: target.clientHeight
  };
};
