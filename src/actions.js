

export default ( scope ) => {

  const { target, win, overscroll, isPageScroll, resetState, getScroll, hasScrollX,
    getFromRange, getScrollSize, getClientSize, hasScrollY, getParent } = scope;

  function setScroll(
    scrollLeft = overscroll.scrollLeft,
    scrollTop = overscroll.scrollTop
  ) {

    // 取出滚动区域大小和可视范围计算滚动位置
    const { scrollTopRange, scrollLeftRange } = overscroll;
    const newScrollTop = scrollTopRange( Math.round( scrollTop ));
    const newScrollLeft = scrollLeftRange( Math.round( scrollLeft ));

    // 重置dom状态
    resetState( newScrollTop, newScrollLeft );

    // 缓存滚动条位置
    overscroll.scrollLeft = newScrollLeft;
    overscroll.scrollTop = newScrollTop;
    if ( isPageScroll ) {
      win.scrollTo( overscroll.scrollLeft, overscroll.scrollTop );
    } else {
      target.scrollTop = overscroll.scrollTop;
      target.scrollLeft = overscroll.scrollLeft;
    }
  }

  function resetCache() {
    const { top, left } = getScroll();
    const { width: scrollWidth, height: scrollHeight } = getScrollSize();
    const { width: clientWidth, height: clientHeight } = getClientSize();
    overscroll.scrollTop = top;
    overscroll.scrollLeft = left;
    overscroll.scrollWidth = scrollWidth;
    overscroll.scrollHeight = scrollHeight;
    overscroll.clientWidth = clientWidth;
    overscroll.clientHeight = clientHeight;
    overscroll.scrollTopRange = getFromRange( 0, scrollHeight - clientHeight );
    overscroll.scrollLeftRange = getFromRange( 0, scrollWidth - clientWidth );
  }

  function getNearestScrollable( dom ) {
    return hasScrollY( dom ) || hasScrollX( dom ) ? dom : getParent( dom, ( dom ) => {
      return hasScrollY( dom ) || hasScrollX( dom );
    });
  }

  return {
    setScroll, resetCache, getNearestScrollable
  };
};
