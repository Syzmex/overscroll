
// 实际情况下 body documentElement 不会都设置 overflow: scroll
// 推荐 html, body { height: 100% } body { overflow: auto; }

function compose( funcA, funcB ) {
  return function( ...args ) {
    return funcA( funcB( ...args ));
  };
}

export default ({ body, html }) => {

  function hasScrollX( dom ) {
    return dom.scrollWidth > dom.clientWidth;
  }

  function hasScrollY( dom ) {
    return dom.scrollHeight > dom.clientHeight;
  }

  function scrollingElement( dom ) {
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
