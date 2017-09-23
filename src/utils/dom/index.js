
import { getOffset, getPosition } from './getOffset';
import getFromRange from './getFromRange';
import getClientSize from './getClientSize';
import getScrollSize from './getScrollSize';
import hasScrollBar from './hasScrollBar';
import contains from './contains';
import domData from './domData';

import getDocument from './getDocument';
import getWindow from './getWindow';
import getParent from './getParent';


export default ( scope ) => {
  return {
    domData,
    contains,
    getFromRange,
    getWindow,
    getParent,
    getDocument,
    getOffset: getOffset( scope ),
    getPosition: getPosition( scope ),
    getClientSize: getClientSize( scope ),
    getScrollSize: getScrollSize( scope ),
    ...hasScrollBar( scope )
  };
};
