

export const getScrollBarSize = ({ doc, body }) => {
  let cached;
  return ( fresh ) => {
    if ( fresh || cached === undefined ) {
      const outer = doc.createElement( 'div' );
      const outerStyle = outer.style;
      outerStyle.position = 'absolute';
      outerStyle.top = 0;
      outerStyle.left = 0;
      outerStyle.pointerEvents = 'none';
      outerStyle.visibility = 'hidden';
      outerStyle.width = '50px';
      outerStyle.height = '50px';
      outerStyle.overflowY = 'scroll';
      outerStyle.boxSizing = 'content-box';
      body.appendChild( outer );
      const clientWidth = outer.clientWidth;
      const offsetWidth = outer.offsetWidth;
      cached = offsetWidth - clientWidth;
      body.removeChild( outer );
    }
    return cached;
  };
};


// export const getPageScrollBarSize = ({ doc, body }) => ( fresh ) => {
//   if ( fresh || cached === undefined ) {
//   const outer = doc.createElement( 'div' );
//   const outerStyle = outer.style;
//   outerStyle.position = 'absolute';
//   outerStyle.top = 0;
//   outerStyle.left = 0;
//   outerStyle.pointerEvents = 'none';
//   outerStyle.visibility = 'hidden';
//   outerStyle.width = '50px';
//   outerStyle.height = '50px';
//   outerStyle.overflowY = 'scroll';
//   outerStyle.boxSizing = 'content-box';
//   body.appendChild( outer );
//   const clientWidth = outer.clientWidth;
//   const offsetWidth = outer.offsetWidth;
//   cached = offsetWidth - clientWidth;
//   body.removeChild( outer );
//   }
//   return cached;
// };
