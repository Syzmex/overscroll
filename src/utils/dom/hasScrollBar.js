
import { get } from '../css';
import { hasData } from './domData';


function compose( funcA, funcB ) {
  return function( ...args ) {
    return funcA( funcB( ...args ));
  };
}

const scrollable = ( attr ) => ( dom ) => {
  return [ 'overlay', 'scroll', 'auto' ].includes( get( dom, attr ));
};

export default ({ body, html, target, OVERSCROLLX, OVERSCROLLY }) => {

  function hasScrollX( dom ) {
    // 页面滚动时必须用 html 计算, body 不设置 height 的情况下可能有
    // dom.scrollHeight === dom.clientHeight 页面也可以滚动
    return dom.scrollWidth > dom.clientWidth &&
      ( hasData( target, OVERSCROLLX ) || scrollable( 'overflow-x' )( target ));
  }

  function hasScrollY( dom ) {
    // 同上
    return dom.scrollHeight > dom.clientHeight &&
      ( hasData( target, OVERSCROLLY ) || scrollable( 'overflow-y' )( target ));
  }

  // 页面滚动情况下之后的计算必须要用 html, 如果获取到的是 body 就要替换成 html
  function scrollElement( dom = target ) {
    return dom === body ? html : dom;
  }

  function hasScroll( dom ) {
    return {
      x: hasScrollX( dom ),
      y: hasScrollY( dom )
    };
  }

  return {
    hasScroll: compose( hasScroll, scrollElement ),
    hasScrollX: compose( hasScrollX, scrollElement ),
    hasScrollY: compose( hasScrollY, scrollElement )
  };
};
