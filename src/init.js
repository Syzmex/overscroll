
import { set } from './utils/css';

export default function( scope ) {

  const { target, axis, hasX, hasY, domData: { setData }, OVERSCROLL,
    OVERSCROLLX, OVERSCROLLY, resetCache } = scope;

  // 添加样式
  set( target, 'overflow', 'hidden' );

  // DOM 打上标记
  setData( target, OVERSCROLL );

  if ( hasX( axis )) {
    setData( target, OVERSCROLLX );
  }

  if ( hasY( axis )) {
    setData( target, OVERSCROLLY );
  }

  // 初始化缓存
  resetCache();

  return scope;
}
