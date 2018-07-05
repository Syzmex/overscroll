
import is from 'whatitis';
import getWindow from './getWindow';

/**
 * 查找符合条件的父节点
 * 如果没有符合条件的父节点返回 window
 */
export default function parentNode( dom, condition ) {
  const parent = dom.parentNode;
  if ( parent && is.Function( condition )) {
    return !!condition( parent ) ? parent : parentNode( parent, condition );
  }
  // document.parentNode === null
  return parent || getWindow( dom );
}
