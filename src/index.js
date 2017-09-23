
import compose from './utils/compose';
import getScope from './scope';
import init from './init';


function OverScroll( scope ) {

  const { overscroll, animation } = scope;

  // function getNearestScrollable( dom ) {
  //   return hasScrollY( dom ) ? dom : getParent( dom, hasScrollY );
  // }
  const { scrollTo } = animation.run();
  setTimeout(() => {
    scrollTo( 50, 500 );
    setTimeout(() => {
      scrollTo( 0, 0 );
    }, 500 );
  }, 1000 );
  // function setScroll(
  //   scrollLeft = overscroll.scrollLeft,
  //   scrollTop = overscroll.scrollTop
  // ) {
  //   // 取出滚动区域大小和可视范围计算滚动位置
  //   const { scrollTopRange, scrollLeftRange } = overscroll;
  //   const newScrollTop = scrollTopRange( scrollTop );
  //   const newScrollLeft = scrollLeftRange( scrollLeft );
  //   // 重置dom状态
  //   resetState( newScrollTop, newScrollLeft );
  //   // 缓存滚动条位置
  //   overscroll.scrollLeft = newScrollLeft;
  //   overscroll.scrollTop = newScrollTop;
  //   if ( isPageScroll ) {
  //     win.scrollTo( overscroll.scrollLeft, overscroll.scrollTop );
  //   } else {
  //     target.scrollTop = overscroll.scrollTop;
  //     target.scrollLeft = overscroll.scrollLeft;
  //   }
  // }

  // function reset() {
  //   const { top, left } = getScroll();
  //   const { width: scrollWidth, height: scrollHeight } = getScrollSize();
  //   const { width: clientWidth, height: clientHeight } = getClientSize();
  //   overscroll.scrollTop = top;
  //   overscroll.scrollLeft = left;
  //   overscroll.scrollWidth = scrollWidth;
  //   overscroll.scrollHeight = scrollHeight;
  //   overscroll.clientWidth = clientWidth;
  //   overscroll.clientHeight = clientHeight;
  //   overscroll.scrollTopRange = getFromRange( 0, scrollHeight - clientHeight );
  //   overscroll.scrollLeftRange = getFromRange( 0, scrollWidth - clientWidth );
  // }

  // const registerScrollMove = () => {
  //   let v = 0;
  //   const a = ( v ) => {
  //     return v > 30 ? 1.5 : ( 1 - Math.cos( Math.PI * v / 30 )) / 2 * 1.5 * 29 / 30 + 1 / 30;
  //   };
  //   let lastTime = 0;
  //   const getVelocity = getFromRange( 2, 50 );
  //   handleDestroy( requestAnimFrame(( time ) => {
  //     const { scrollLeft, scrollTop } = overscroll;
  //     if ( lastTime === 0 ) {
  //       reset( scope );
  //     } else if ( hasScrollY() && v !== 0 ) {
  //       v = sign( v ) * Math.max( 0, Math.abs( v ) - a( Math.abs( v )));
  //       setScroll( scrollLeft, scrollTop + v );
  //     }
  //     lastTime = time;
  //   }).cancel );
  //   return {
  //     scrollMove( velocity ) {
  //       if ( v > 0 !== velocity > 0 ) {
  //         v = 0;
  //       }
  //       v += sign( velocity ) * getVelocity( Math.abs( velocity ));
  //       v = sign( velocity ) * getVelocity( Math.abs( v ));
  //     },
  //     scrollStop() {
  //       v = 0;
  //       setScroll();
  //     }
  //   };
  // };

  // const registerSectionMove = () => {
  //   let v = 0;
  //   let d = 0;
  //   const boundOut = ( t ) => Math.sin( Math.PI * t );
  //   const esseOut = ( t ) => {
  //     return t < 0.5 ? 1.5 : Math.sin( Math.PI * t ) * 1.5 * 29 / 30 + 1 / 30;
  //   };
  //   const divisor = ( d, S ) => esseOut((( S - d ) / S ));
  //   const bound = ( d, S ) => boundOut((( S - d ) / S ));
  //   let rebound = false;
  //   handleDestroy( requestAnimFrame(() => {
  //     const { scrollLeft, scrollTop, clientHeight } = overscroll;
  //     if ( hasScrollY() && d !== 0 ) {
  //       if ( v > 0 !== d > 0 ) {
  //         rebound = true;
  //         v += sign( d ) * Math.max( 0.5, 10 * bound( Math.abs( d ), clientHeight ));
  //         d -= v;
  //       } else if ( rebound ) {
  //         v = sign( d ) * Math.max( 0.5, 30 * bound( Math.abs( d ), clientHeight ));
  //         d = sign( d ) * Math.max( Math.abs( d ) - Math.abs( v ), 0 );
  //       } else {
  //         v = sign( d ) * Math.max( 0.5, 30 * divisor( Math.abs( d ), clientHeight ));
  //         d = sign( d ) * Math.max( Math.abs( d ) - Math.abs( v ), 0 );
  //       }
  //       setScroll( scrollLeft, scrollTop + v );
  //     }
  //     if ( d === 0 ) {
  //       rebound = false;
  //       v = 0;
  //     }
  //   }).cancel );
  //   return {
  //     scrollMove( velocity, distance ) {
  //       rebound = false;
  //       v = velocity;
  //       d = distance;
  //     },
  //     scrollStop() {
  //       rebound = false;
  //       v = 0;
  //       d = 0;
  //       setScroll();
  //     }
  //   };
  // };

  // let scrollMove;
  // let scrollStop;
  // if ( mode === 'section' ) {
  //   const modeMove = registerSectionMove();
  //   scrollMove = modeMove.scrollMove;
  //   scrollStop = modeMove.scrollStop;
  // }

  // if ( mode === 'scroll' ) {
  //   const modeMove = registerScrollMove();
  //   scrollMove = modeMove.scrollMove;
  //   scrollStop = modeMove.scrollStop;
  // }

  // function addMouseWheelEvent({ target, html, onScroll, isPageScroll }) {
  //   const eventName = browser.firefox ? 'DOMMouseScroll' : 'mousewheel';
  //   handleDestroy( addEventListener( target, 'mousedown', scrollStop ).remove );
  //   handleDestroy( addEventListener( isPageScroll ? html : target, eventName, ( event ) => {console.log(event)
  //     const { deltaY } = event;
  //     const { top, left } = getScroll();
  //     const scrollble = getNearestScrollable( event.target );
  //     if ( scrollble === target ) {
  //       reset({ target });
  //       scrollMove( -deltaY );
  //       if ( !isPageScroll ) {
  //         if ( isTop() && deltaY > 0 ) {
  //           // event.stopPropagation();
  //         } else if ( isBottom() && deltaY < 0 ) {
  //           // event.stopPropagation();
  //         } else {
  //           event.preventDefault();
  //           event.stopPropagation();
  //         }
  //       }
  //       if ( is.Function( onScroll )) {
  //         onScroll.call( target, top, left, event );
  //       }
  //     }
  //   }).remove );
  // }

  // function addHammerScroll({ target }) {
  //   let scrollLeft;
  //   let scrollTop;
  //   const manager = new Hammer.Manager( target );
  //   manager.add( new Hammer.Pan({ direction: Hammer.DIRECTION_ALL, threshold: 0 }));
  //   manager.on( 'panstart panmove panend', ( event ) => {
  //     event.preventDefault();
  //     const { type, deltaY } = event;
  //     const overscroll = getNearestScrollable( event.target );
  //     if ( overscroll === target ) {
  //       if ( type === 'panstart' ) {
  //         reset( scope );
  //         scrollLeft = overscroll.scrollLeft;
  //         scrollTop = overscroll.scrollTop;
  //       } else if ( type === 'panend' ) {
  //         scrollMove( -event.velocityY * 20 );
  //       } else if ( deltaY !== 0 ) {
  //         setScroll( scrollLeft, scrollTop - deltaY );
  //       }
  //     }
  //   });
  //   handleDestroy(() => manager.destroy());
  //   handleDestroy( addEventListener( target, 'touchstart', scrollStop ).remove );
  // }

  // if ( mode === 'scroll' ) {
  //   addHammerScroll( scope );
  //   addMouseWheelEvent( scope );
  // }

  // function getPoss({ anchors }) {
  //   const { top: scrollTop } = getScroll();
  //   return anchors.map( getPosition ).map(({ top }) => top + scrollTop );
  // }

  // function initSections({ target, anchors }) {
  //   set( target, 'height', '100%' );
  //   anchors.forEach(( element ) => {
  //     set( element, 'height', '100%' );
  //   });
  // }

  // function addHammerSection({ target, switchScale }) {
  //   let poss;
  //   let scrollLeft;
  //   let scrollTop;
  //   const [ upScale, downScale ] = switchScale;
  //   const mc = new Hammer.Manager( target );
  //   mc.add( new Hammer.Pan({ direction: Hammer.DIRECTION_ALL, threshold: 0 }));
  //   mc.on( 'panstart panmove panend', ( event ) => {
  //     event.preventDefault();
  //     const { type, deltaY } = event;
  //     const overscroll = getNearestScrollable( event.target );
  //     if ( overscroll === target ) {
  //       if ( type === 'panstart' ) {
  //         reset( scope );
  //         scrollLeft = overscroll.scrollLeft;
  //         scrollTop = overscroll.scrollTop;
  //       } else if ( type === 'panend' ) {
  //         reset( scope );
  //         poss = getPoss( scope );
  //         const { clientHeight } = overscroll;
  //         scrollLeft = overscroll.scrollLeft;
  //         scrollTop = overscroll.scrollTop;
  //         const { deltaY, velocityY } = event;
  //         const nearest = poss.reduce(( line, top ) => {
  //           return top > scrollTop && top < clientHeight + scrollTop ? top : line;
  //         }, 0 );
  //         if ( nearest !== 0 ) {
  //           // 初速度足够触发上下滑动
  //           if ( velocityY > 0.5 ) { // 下滑
  //             scrollMove( -velocityY * 20, nearest - ( scrollTop + clientHeight ));
  //           } else if ( velocityY < -0.5 ) { // 上滑
  //             scrollMove( -velocityY * 20, nearest - scrollTop );
  //           }
  //           // 靠近上方
  //           else if ( nearest - scrollTop < downScale * clientHeight ) {
  //             scrollMove( -velocityY * 20, nearest - scrollTop );
  //           }
  //           // 靠近下方
  //           else if ( clientHeight + scrollTop - nearest < upScale * clientHeight ) {
  //             scrollMove( -velocityY * 20, nearest - ( scrollTop + clientHeight ));
  //           }
  //           // 在中间位置
  //           else if ( deltaY > 0 ) {
  //             scrollMove( -velocityY * 20, nearest - ( scrollTop + clientHeight ));
  //           } else if ( deltaY < 0 ) {
  //             scrollMove( -velocityY * 20, nearest - scrollTop );
  //           } else if ( nearest - scrollTop > clientHeight / 2 ) {
  //             scrollMove( 0, nearest - ( scrollTop + clientHeight ));
  //           } else {
  //             scrollMove( 0, nearest - scrollTop );
  //           }
  //         }
  //       } else if ( deltaY !== 0 ) {
  //         setScroll( scrollLeft, scrollTop - deltaY );
  //       }
  //     }
  //   });
  //   handleDestroy(() => mc.destroy());
  //   handleDestroy( addEventListener( target, 'touchstart', scrollStop ).remove );
  // }

  // if ( mode === 'section' ) {
  //   initSections( scope );
  //   addHammerSection( scope );
  // }

  return {
    destroy: overscroll.onDestroy
  };
}

export default compose( OverScroll, init, getScope );
