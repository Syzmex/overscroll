
import is from 'whatitis';


export const X = 'x';
export const Y = 'y';
export const XY = 'xy';
export const xreg = /x/i;
export const yreg = /y/i;
export const OVERSCROLLJS = 'overscrolljs';

export function hasX( axis ) {
  return xreg.test( axis );
}

export function hasY( axis ) {
  return yreg.test( axis );
}

export function hasXY( axis ) {
  return hasX( axis ) && hasY( axis );
}

export function getAxis( axis ) {
  if ( hasXY( axis )) {
    return XY;
  } else if ( hasX( axis )) {
    return X;
  }
  return Y;
}

export function getDocument( dom ) {
  return is.Element( dom ) ? dom.ownerDocument : document;
}

export function getWindow( dom ) {
  const doc = is.Document( dom ) ? dom : getDocument( dom );
  return doc.defaultView || window;
}

export const getScrollByAxis = ({ axis, win, html, body, isPageScroll }) => ( target ) => {
  // CSS1Compat 标准模式 BackCompat 混杂模式
  // const isCSS1Compat = doc.compatMode === 'CSS1Compat';
  const scrollX = () => {
    return !isPageScroll ? target.scrollLeft : is.Defined( win.pageXOffset ) ? win.pageXOffset
      : Math.max( html.scrollLeft, body.scrollLeft );
  };
  const scrollY = () => {
    return !isPageScroll ? target.scrollTop : is.Defined( win.pageYOffset ) ? win.pageYOffset
      : Math.max( html.scrollTop, body.scrollTop );
  };
  if ( hasXY( axis )) {
    return {
      top: scrollX(),
      left: scrollY()
    };
  } else if ( hasX( axis )) {
    return {
      top: 0,
      left: scrollX()
    };
  }
  return {
    top: scrollY(),
    left: 0
  };
};


export default {
  X, Y, XY, xreg, yreg, OVERSCROLLJS, hasX, hasY, hasXY, getAxis, getDocument, // eslint-disable-line
  getWindow, getScrollByAxis // eslint-disable-line
};
