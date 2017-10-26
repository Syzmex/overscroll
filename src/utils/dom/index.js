
import { getOffset, getPosition } from './getOffset';
import getFromRange from './getFromRange';
import getClientSize from './getClientSize';
import getScrollSize from './getScrollSize';
import hasScrollBar from './hasScrollBar';
import contains from './contains';
import domData, { hasData } from './domData';

import getDocument from './getDocument';
import getWindow from './getWindow';
import getParent from './getParent';


export default ( scope ) => {
  const { target, NOBUBBLE } = scope;
  const hasScrollBarFuncs = hasScrollBar( scope );
  const { hasScrollY, hasScrollX } = hasScrollBarFuncs;

  function getNearestScrollable( dom ) {
    return target === dom || hasData( dom, NOBUBBLE ) || hasScrollY( dom ) || hasScrollX( dom ) ? dom : getParent( dom, ( dom ) => {
      return target === dom || hasData( dom, NOBUBBLE ) || hasScrollY( dom ) || hasScrollX( dom );
    });
  }

  return {
    domData,
    contains,
    getFromRange,
    getWindow,
    getParent,
    getDocument,
    getNearestScrollable,
    getOffset: getOffset( scope ),
    getPosition: getPosition( scope ),
    getClientSize: getClientSize( scope ),
    getScrollSize: getScrollSize( scope ),
    ...hasScrollBarFuncs
  };
};

