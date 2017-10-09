

export default ( scope ) => {

  const { target, win, overscroll, isPageScroll, resetState, getScroll,
    getFromRange, getScrollSize, getClientSize } = scope;

  function setScroll(
    scrollLeft = overscroll.scrollLeft,
    scrollTop = overscroll.scrollTop
  ) {
    // 取出滚动区域大小和可视范围计算滚动位置
    const { scrollTopRange, scrollLeftRange } = overscroll;
    const newScrollTop = scrollTopRange( scrollTop );
    const newScrollLeft = scrollLeftRange( scrollLeft );

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

  return {
    setScroll, resetCache
  };
};
