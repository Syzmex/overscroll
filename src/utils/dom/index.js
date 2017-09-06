
import { getOffset, getPosition } from './getOffset';
import getFromRange from './getFromRange';
import getClientSize from './getClientSize';
import getScrollSize from './getScrollSize';

export default ( scope ) => {
  return {
    getFromRange,
    getOffset: getOffset( scope ),
    getPosition: getPosition( scope ),
    getClientSize: getClientSize( scope ),
    getScrollSize: getScrollSize( scope )
  };
};
