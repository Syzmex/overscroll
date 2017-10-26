
import { get } from '../css';
import { hasData } from './domData';

// 实际情况下 body documentElement 不会都设置 overflow: scroll
// 推荐 html, body { height: 100% } body { overflow: auto; }

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
    return dom.scrollWidth > dom.clientWidth &&
      ( hasData( dom, OVERSCROLLX ) || scrollable( 'overflow-x' )( dom ));
  }

  function hasScrollY( dom ) {
    return dom.scrollHeight > dom.clientHeight &&
      ( hasData( dom, OVERSCROLLY ) || scrollable( 'overflow-y' )( dom ));
  }

  function scrollingElement( dom = target ) {
    return dom === body ? html : dom;
  }

  function hasScroll( dom ) {
    return {
      x: hasScrollX( dom ),
      y: hasScrollY( dom )
    };
  }

  return {
    hasScroll: compose( hasScroll, scrollingElement ),
    hasScrollX: compose( hasScrollX, scrollingElement ),
    hasScrollY: compose( hasScrollY, scrollingElement )
  };
};
