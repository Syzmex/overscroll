
export default ( scope ) => {

  const { target, overscroll, domData: { setData, hasData, removeData },
    hasScrollY, hasScrollX } = scope;

  function handleState( states ) {
    return function( target, state = '' ) {
      if ( !hasData( target, state )) {
        states.filter(
          ( elemState ) => state !== elemState && hasData( target, elemState )
        ).forEach(( state ) => removeData( target, state ));
        if ( state && states.includes( state )) {
          setData( target, state );
        }
      }
    };
  }

  // 滚动位置
  const setPositionX = handleState([ 'scrollLeft', 'scrollRight', 'scrollX' ]);
  const setPositionY = handleState([ 'scrollTop', 'scrollBottom', 'scrollY' ]);

  // 动画状态
  const setAnimationX = handleState(['scrollingX']);
  const setAnimationY = handleState(['scrollingY']);

  // 方向
  const setDirectionX = handleState([ 'scrollingLeft', 'scrollingRight' ]);
  const setDirectionY = handleState([ 'scrollingUp', 'scrollingDown' ]);


  function animatingX() {
    setAnimationX( target, 'scrollingX' );
  }

  function animatingY() {
    setAnimationY( target, 'scrollingY' );
  }

  function scrollingUp() {
    setDirectionY( target, 'scrollingUp' );
  }

  function scrollingDown() {
    setDirectionY( target, 'scrollingDown' );
  }

  function scrollingLeft() {
    setDirectionX( target, 'scrollingLeft' );
  }

  function scrollingRight() {
    setDirectionX( target, 'scrollingRight' );
  }

  function scrollingStopX() {
    setDirectionX( target );
    setAnimationX( target );
  }

  function scrollingStopY() {
    setDirectionY( target );
    setAnimationY( target );
  }

  function isTop( dom = overscroll ) {
    return dom.scrollTop < 1;
  }

  function isBottom( dom = overscroll ) {
    return dom.scrollTop === dom.scrollHeight - dom.clientHeight;
  }

  function isLeft( dom = overscroll ) {
    return dom.scrollLeft < 1;
  }

  function isRight( dom = overscroll ) {
    return dom.scrollLeft === dom.scrollWidth - dom.clientWidth;
  }

  function canScroll( dom ) {
    return {
      top: hasScrollY( dom ) && !isTop( dom ),
      left: hasScrollX( dom ) && !isLeft( dom ),
      right: hasScrollX( dom ) && !isRight( dom ),
      bottom: hasScrollY( dom ) && !isBottom( dom )
    };
  }

  // 滚动状态设置完成后运行该函数
  function resetState( scrollTop = 0, scrollLeft = 0 ) {

    // 位置判断 -----------------
    // 纵向状态设置
    if ( isTop()) {
      setPositionY( target, 'scrollTop' );
    } else if ( isBottom()) {
      setPositionY( target, 'scrollBottom' );
    } else {
      setPositionY( target, 'scrollY' );
    }

    // 横向状态设置
    if ( isLeft()) {
      setPositionX( target, 'scrollLeft' );
    } else if ( isRight()) {
      setPositionX( target, 'scrollRight' );
    } else {
      setPositionX( target, 'scrollX' );
    }

    // 滚动状态判断 ----------------
    if ( scrollTop === 0 || overscroll.scrollTop === scrollTop ) {
      scrollingStopY();
    } else if ( overscroll.scrollTop > scrollTop ) {
      animatingY();
      scrollingDown();
    } else if ( overscroll.scrollTop < scrollTop ) {
      animatingY();
      scrollingUp();
    }

    if ( scrollLeft === 0 || overscroll.scrollLeft === scrollLeft ) {
      scrollingStopX();
    } else if ( overscroll.scrollLeft > scrollLeft ) {
      animatingX();
      scrollingRight();
    } else if ( overscroll.scrollLeft < scrollLeft ) {
      animatingX();
      scrollingLeft();
    }

  }

  return {
    isTop,
    isBottom,
    isLeft,
    isRight,
    animatingX,
    animatingY,
    scrollingUp,
    scrollingDown,
    scrollingLeft,
    scrollingRight,
    scrollingStopX,
    scrollingStopY,
    resetState,
    canScroll
  };

};
