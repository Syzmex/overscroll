
export const getOuterWidth = ({ win, html, body }) => ( el ) => {
  if ( el === body ) {
    return win.innerWidth || html.clientWidth;
  }
  return el.offsetWidth;
}

export const getOuterHeight = ({ win, html, body }) => ( el ) => {
  if ( el === body ) {
    return win.innerHeight || html.clientHeight;
  }
  return el.offsetHeight;
}
