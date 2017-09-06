
export default ({ body, html, target, isPageScroll }) => () => {
  let width;
  let height;
  if ( isPageScroll ) {
    width = Math.max( html.scrollWidth, body.scrollWidth );
    height = Math.max( html.scrollHeight, body.scrollHeight );
  } else {
    width = target.scrollWidth;
    height = target.scrollHeight;
  }
  return { width, height };
};
