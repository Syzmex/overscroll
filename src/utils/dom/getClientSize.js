
export default ({ html, target, isPageScroll }) => () => {
  let width;
  let height;
  if ( isPageScroll ) {
    width = html.clientWidth;
    height = html.clientHeight;
  } else {
    width = target.clientWidth;
    height = target.clientHeight;
  }
  return { width, height };
};
