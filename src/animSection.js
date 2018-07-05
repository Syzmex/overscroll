
import Hammer from 'hammerjs';
import { set } from './utils/css';
import addEventListener from './utils/dom/addDomEventListener';
import { requestAnimFrame } from './utils/requestAnimFrame';

function sign( number ) {
  return number > 0 ? 1 : -1;
}

const boundOut = ( t ) => Math.sin( Math.PI * t );
const esseOut = ( t ) => {
  return t < 0.5 ? 1.5 : Math.sin( Math.PI * t ) * 2.5 * 29 / 30 + 1 / 30;
};
const divisor = ( d, S ) => esseOut((( S - d ) / S ));
const bound = ( d, S ) => boundOut((( S - d ) / S ));

const abs = Math.abs;
const max = Math.max;

export default ( scope ) => {

  const { scrollX, scrollY, handleDestroy, overscroll, hasScrollY, hasScrollX,
    setScroll, target, switchScale, anchors, getPosition, resetCache, getScroll,
    scrollable, onScroll, onAfterScroll, onBeforeScroll, handleAfterScroll,
    handleBeforeScroll, handleScroll, handleInit, dragable, touchable } = scope;

  // 横向排版 getPosition 有小数，所以加上范围限制保证在寻找缓存中的位置信息时能够精确找到

  function getYPoss() {
    const { scrollTopRange } = overscroll;
    const { top: scrollTop } = getScroll();
    return anchors.map( getPosition ).map(({ top }) => scrollTopRange( top + scrollTop ));
  }

  function getXPoss() {
    const { scrollLeftRange } = overscroll;
    const { left: scrollLeft } = getScroll();
    return anchors.map( getPosition ).map(({ left }) => scrollLeftRange( left + scrollLeft ));
  }

  let possX;
  let possY;
  let scrollCache = null;

  const getNearest = ( pos ) => {
    const positions = scrollX ? possX : possY;
    return positions.reduce(( nearest, position ) => {
      return abs( position - pos ) < abs( nearest - pos ) ? position : nearest;
    }, null );
  };

  const frame = ( v, d, s, rebound ) => {
    if (( v > 0 && d < 0 ) || ( v < 0 && d > 0 )) {
      rebound = true;
      v += sign( d ) * max( 0.5, 10 * bound( abs( d ), s ));
      d -= v;
    } else if ( rebound ) {
      v = sign( d ) * max( 0.5, 30 * bound( abs( d ), s ));
      if ( abs( d ) < abs( v )) {
        v = d;
      }
      d = sign( d ) * max( abs( d ) - abs( v ), 0 );
    } else {
      v = sign( d ) * max( 0.5, 30 * divisor( abs( d ), s ));
      if ( abs( d ) < abs( v )) {
        v = d;
      }
      d = sign( d ) * max( abs( d ) - abs( v ), 0 );
    }
    return {
      v, d, rebound
    };
  };

  const runAnimFrame = () => {
    let vx = 0;
    let vy = 0;
    let dx = 0;
    let dy = 0;
    let odx = 0;
    let ody = 0;
    let ovx = 0;
    let ovy = 0;
    let reboundX = false;
    let reboundY = false;
    handleDestroy( requestAnimFrame(() => {

      const { scrollLeft, scrollTop, clientHeight, clientWidth } = overscroll;

      if ( hasScrollY() && dy !== 0 ) {
        const computed = frame( vy, dy, clientHeight, reboundY );
        vy = computed.v;
        dy = computed.d;
        reboundY = computed.rebound;
      } else if ( hasScrollX() && dx !== 0 ) {
        const computed = frame( vx, dx, clientWidth, reboundX );
        vx = computed.v;
        dx = computed.d;
        reboundX = computed.rebound;
      }

      if ( !overscroll.scrolling &&
        ovx === 0 && ovy === 0 && ( dx !== 0 || dy !== 0 )
      ) {
        onBeforeScroll();
      }

      if ( vx !== 0 || vy !== 0 ) {
        setScroll(
          dx === 0 ? getNearest( scrollLeft + vx ) : scrollLeft + vx,
          dy === 0 ? getNearest( scrollTop + vy ) : scrollTop + vy
        );
        if ( dx !== 0 || dy !== 0 ) {
          onScroll();
        }
      }

      if ( dy === 0 ) {
        reboundY = false;
        vy = 0;
        ody = 0;
      }
      if ( dx === 0 ) {
        reboundX = false;
        vx = 0;
        odx = 0;
      }

      if ( overscroll.scrolling &&
        vx === 0 && vy === 0 && dx === 0 && dy === 0 && ( ovx !== 0 || ovy !== 0 )
      ) {
        scrollCache = null;
        setScroll();
        onAfterScroll();
      }

      ovx = vx;
      ovy = vy;

    }).cancel );
    return {
      scrollMove( velocity, distance ) {
        if ( scrollX ) {
          reboundX = false;
          vx = velocity;
          dx = distance;
          odx = distance;
        } else {
          reboundY = false;
          vy = velocity;
          dy = distance;
          ody = distance;
        }
      },
      scrollStop() {
        if ( vx !== 0 || vy !== 0 || dx !== 0 || dy !== 0 ) {
          scrollCache = {
            vx, vy, dx, dy, odx, ody, reboundX, reboundY
          };
        }
        vx = 0;
        vy = 0;
        dx = 0;
        ovx = 0;
        ovy = 0;
        dy = 0;
        odx = 0;
        ody = 0;
        reboundX = false;
        reboundY = false;
        setScroll();
      },
      scrollRestore() {
        if ( scrollCache ) {
          vx = scrollCache.vx;
          vy = scrollCache.vy;
          dx = scrollCache.dx;
          dy = scrollCache.dy;
          odx = scrollCache.odx;
          ody = scrollCache.ody;
          reboundX = scrollCache.reboundX;
          reboundY = scrollCache.reboundY;
        }
      },
      scrollClear() {
        scrollCache = null;
      }
    };
  };

  function runHammer({ scrollMove, scrollStop, scrollRestore, scrollClear }) {
    let lastDeltaX;
    let lastDeltaY;
    let handleTarget;
    const directionX = [ 2, 4 ];
    const directionY = [ 8, 16 ];
    const [ upScale, downScale ] = switchScale;
    const mc = new Hammer.Manager( target );
    const sectionMoving = ( v, nearestpos, curpos, d, delta ) => {
      // 初速度足够触发上下滑动
      if ( v > 0.5 ) { // 下滑
        scrollMove( -v * 20, nearestpos - ( curpos + d ));
      } else if ( v < -0.5 ) { // 上滑
        scrollMove( -v * 20, nearestpos - curpos );
      }
      // 靠近上方
      else if ( nearestpos - curpos < downScale * d ) {
        scrollMove( -v * 20, nearestpos - curpos );
      }
      // 靠近下方
      else if ( d + curpos - nearestpos < upScale * d ) {
        scrollMove( -v * 20, nearestpos - ( curpos + d ));
      }
      // 在中间位置
      else if ( delta > 0 ) {
        scrollMove( -v * 20, nearestpos - ( curpos + d ));
      } else if ( delta < 0 ) {
        scrollMove( -v * 20, nearestpos - curpos );
      } else if ( nearestpos - curpos > d / 2 ) {
        scrollMove( 0, nearestpos - ( curpos + d ));
      } else {
        scrollMove( 0, nearestpos - curpos );
      }
    };


    if ( dragable ) {
      handleDestroy( addEventListener( target, 'mousedown', scrollStop ).remove );
      handleDestroy( addEventListener( target, 'mouseup', scrollRestore ).remove );
    }

    if ( touchable ) {
      handleDestroy( addEventListener( target, 'touchstart', scrollStop ).remove );
      handleDestroy( addEventListener( target, 'touchend', scrollRestore ).remove );
      handleDestroy( addEventListener( target, 'touchcancel', scrollRestore ).remove );
    }

    mc.add( new Hammer.Pan({ direction: Hammer.DIRECTION_ALL, threshold: 0 }));
    mc.on( 'panstart panmove panend', ( event ) => {
      event.preventDefault();

      if ( !dragable && event.pointerType === 'mouse' ) {
        return;
      }

      if ( !touchable && event.pointerType === 'touch' ) {
        return;
      }

      const { type, velocityY, velocityX, deltaX, deltaY, offsetDirection } = event;
      const rightDirection = ( scrollY ? directionY : directionX ).includes( offsetDirection );
      const targetScrollable = scrollable( handleTarget || event.target );
      const targetUnscrollableX = ( !targetScrollable.left && velocityX >= 0 ) ||
        ( !targetScrollable.right && velocityX <= 0 );
      const targetUnscrollableY = ( !targetScrollable.top && velocityY >= 0 ) ||
        ( !targetScrollable.bottom && velocityY <= 0 );
      const scrollTop = overscroll.scrollTop;
      const scrollLeft = overscroll.scrollLeft;
      let x = scrollLeft;
      let y = scrollTop;
      if ( type === 'panstart' ) {
        resetCache( scope );
        lastDeltaX = 0;
        lastDeltaY = 0;
        handleTarget = event.target;
        if ( !targetUnscrollableY || !targetUnscrollableX ) {
          scrollClear();
        }
      } else if ( type === 'panend' && scrollY ) {
        handleTarget = null;
        possY = getYPoss();
        if ( !targetUnscrollableY ) {
          scrollClear();
        }
        if ( !possY.includes( scrollTop )) {
          const { clientHeight } = overscroll;
          const { deltaY, velocityY } = event;
          const nearestpos = possY.reduce(( pos, top ) => {
            return top > scrollTop && top < clientHeight + scrollTop ? top : pos;
          }, 0 );
          if ( nearestpos !== 0 ) {
            sectionMoving( velocityY, nearestpos, scrollTop, clientHeight, deltaY );
          }
        }
      } else if ( type === 'panend' && scrollX ) {
        handleTarget = null;
        possX = getXPoss();
        if ( !targetUnscrollableX ) {
          scrollClear();
        }
        if ( !possX.includes( scrollLeft )) {
          const { clientWidth } = overscroll;
          const { deltaX, velocityX } = event;
          const nearestpos = possX.reduce(( pos, left ) => {
            return left > scrollLeft && left < clientWidth + scrollLeft ? left : pos;
          }, 0 );
          if ( nearestpos !== 0 ) {
            sectionMoving( velocityX, nearestpos, scrollLeft, clientWidth, deltaX );
          }
        }
      } else if ( rightDirection ) {
        if ( !targetUnscrollableX ) {
          x = scrollLeft - ( deltaX - lastDeltaX );
        }
        if ( !targetUnscrollableY ) {
          y = scrollTop - ( deltaY - lastDeltaY );
        }
        if ( x !== scrollLeft || y !== scrollTop ) {
          if ( !overscroll.scrolling ) {
            onBeforeScroll();
          }
          setScroll( x, y );
          onScroll();
        }
      }
      lastDeltaX = deltaX;
      lastDeltaY = deltaY;
    });

    handleDestroy(() => mc.destroy());
  }

  function position( runtime ) {
    const { scrollLeft, scrollTop } = overscroll;
    const curpos = scrollX ? scrollLeft : scrollTop;
    const poss = scrollX ? ( runtime ? getXPoss() : possX ) : ( runtime ? getYPoss() : possY );
    return poss.filter(( pos ) => pos <= curpos ).length;
  }

  function setPositionCache() {
    overscroll.positions = scrollX ? possX : possY;
  }

  handleInit( setPositionCache );
  handleScroll( setPositionCache );
  handleBeforeScroll( setPositionCache );
  handleAfterScroll( setPositionCache );

  function setSectionCache() {
    overscroll.section = position();
  }

  // handleScroll( setSectionCache );
  // handleBeforeScroll( setSectionCache );
  handleAfterScroll( setSectionCache );

  function initSections() {
    // 设置 anchor 样式撑满容器
    anchors.forEach(( element ) => {
      set( element, 'height', '100%' );
      set( element, 'width', '100%' );
    });
    // 重置容器信息
    resetCache();
    if ( scrollX ) {
      possX = getXPoss();
    } else {
      possY = getYPoss();
    }
    overscroll.section = position( true );
  }

  return {
    run() {
      initSections();
      const anim = runAnimFrame();
      if ( dragable || touchable ) {
        runHammer( anim );
      }
      return {
        position: () => position( true ),
        scrollTo( targetPos, noAnimation ) {
          resetCache();
          const poss = scrollX ? getXPoss() : getYPoss();
          const { scrollLeft, scrollTop, clientWidth, clientHeight } = overscroll;
          const curpos = scrollX ? scrollLeft : scrollTop;
          const d = scrollX ? clientWidth : clientHeight;
          const curIndex = poss.indexOf( curpos ) + 1;
          const index = poss.filter(( pos ) => pos <= targetPos ).length;

          if ( scrollX ) {
            possX = poss;
          } else {
            possY = poss;
          }

          if ( noAnimation === true ) {
            setScroll( scrollX ? poss[index - 1] : 0, scrollY ? poss[index - 1] : 0 );
          } else if ( curIndex !== index ) {
            anim.scrollStop();
            anim.scrollClear();
            anim.scrollMove( 0, d * ( index - 1 ) - curpos );
          }
        },
        scrollToSection( index, noAnimation ) {
          resetCache();
          const { scrollLeft, scrollTop, clientWidth, clientHeight } = overscroll;
          const poss = scrollX ? getXPoss() : getYPoss();
          const curpos = scrollX ? scrollLeft : scrollTop;
          const d = scrollX ? clientWidth : clientHeight;
          const curIndex = poss.indexOf( curpos ) + 1;

          if ( scrollX ) {
            possX = poss;
          } else {
            possY = poss;
          }

          if ( noAnimation === true ) {
            setScroll( scrollX ? poss[index - 1] : 0, scrollY ? poss[index - 1] : 0 );
          } else if ( curIndex !== index ) {
            anim.scrollStop();
            anim.scrollClear();
            anim.scrollMove( 0, d * ( index - 1 ) - curpos );
          }
        }
      };
    }
  };
};
