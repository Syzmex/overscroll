
export default ({ body, html, target, isPageScroll }) => () => {
  return isPageScroll ? {
    width: Math.max( html.scrollWidth, body.scrollWidth ),
    height: Math.max( html.scrollHeight, body.scrollHeight )
  } : {
    width: target.scrollWidth,
    height: target.scrollHeight
  };
};
