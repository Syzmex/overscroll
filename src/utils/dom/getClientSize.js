
export default ({ /* win, */ html, target, isPageScroll }) => () => {
  let width;
  let height;
  if ( isPageScroll ) {
    width = html.clientWidth;
    height = html.clientHeight;
    // width = win.innerWidth || html.clientWidth;
    // height = win.innerHeight || html.clientHeight;
  } else {
    width = target.clientWidth;
    height = target.clientHeight;
  }
  return { width, height };
};
