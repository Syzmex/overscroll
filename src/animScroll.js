
import is from 'whatitis';
import Hammer from 'hammerjs';
import browser from './utils/browser';
import addEventListener from './utils/dom/addDomEventListener';
import { requestAnimFrame } from './utils/requestAnimationFrame';

function sign( number ) {
  return number > 0 ? 1 : -1;
}

const a = ( v ) => {
  return v > 30 ? 1.5 : ( 1 - Math.cos( Math.PI * v / 30 )) / 2 * 1.5 * 29 / 30 + 1 / 30;
};

const easeInOut = function( t, b, c, d ) {
  if (( t /= d / 2 ) < 1 ) return c / 2 * t * t + b; // eslint-disable-line
  return -c / 2 * (( --t ) * ( t - 2 ) - 1 ) + b;
};

export default ( scope ) => {

  const { handleDestroy, overscroll, hasScrollY, target, html,
    onScroll, isPageScroll, resetCache, scrollable, isTop, isBottom, isLeft,
    isRight, getFromRange, hasScrollX, onBeforeScroll, onAfterScroll, scrollX,
    scrollY, getScroll, dragable, touchable } = scope;

  const xory = ( func ) => ( x, y ) => {
    if ( scrollX && scrollY ) {
      func( x, y );
    } else if ( scrollX ) {
      func( x );
    } else {
      func( undefined, is.Defined( y ) ? y : x );
    }
  };

  const abs = Math.abs;
  const max = Math.max;
  const min = Math.min;
  const setScroll = xory( scope.setScroll );
  const getVelocity = ( v ) => {
    return v === 0 ? 0 : getFromRange( 2, 50 )( v );
  };

  function runAnimFrame() {
    let vx = 0;
    let vy = 0;
    let dx = 0;
    let dy = 0;
    let ovx = 0;
    let ovy = 0;
    let odx = 0;
    let ody = 0;
    let posX = 0;
    let posY = 0;
    let lastTime = 0;
    let timePointX = 0;
    let timePointY = 0;
    handleDestroy( requestAnimFrame(( time ) => {
      const { scrollLeft, scrollTop } = overscroll;
      // 滚动到指定位置
      if ( dx !== 0 || dy !== 0 ) {
        if ( hasScrollY() && dy !== 0 ) {
          timePointY = min( timePointY, 1 );
          const start = posY - ody;
          const delta = sign( ody ) * easeInOut( timePointY, 0, abs( ody ), 1 );
          dy = ody - delta;
          vy = delta - ( scrollTop - start );
          // 向下/向上
          if (( isBottom() && vy > 0 ) || ( isTop() && vy < 0 )) {
            vy = 0;
            dy = 0;
          }
          if ( timePointY === 1 ) {
            dy = 0;
          } else {
            timePointY += ( time - lastTime ) / 1000;
          }
        }
        if ( hasScrollX() && dx !== 0 ) {
          timePointX = min( timePointX, 1 );
          const start = posX - odx;
          const delta = sign( odx ) * easeInOut( timePointX, 0, abs( odx ), 1 );
          dx = odx - delta;
          vx = delta - ( scrollLeft - start );
          // 向右/向左
          if (( isRight() && vx > 0 ) || ( isLeft() && vx < 0 )) {
            vx = 0;
            dx = 0;
          }
          if ( timePointX === 1 ) {
            dx = 0;
          } else {
            timePointX += ( time - lastTime ) / 1000;
          }
        }
      }

      // 正常的滚动
      else {
        if ( hasScrollY() && vy !== 0 ) {
          vy = sign( vy ) * max( 0, abs( vy ) - a( abs( vy )));
          // 向下/向上
          if (( isBottom() && vy > 0 ) || ( isTop() && vy < 0 )) {
            vy = 0;
          }
        }
        if ( hasScrollX() && vx !== 0 ) {
          vx = sign( vx ) * max( 0, abs( vx ) - a( abs( vx )));
          // 向右/向左
          if (( isRight() && vx > 0 ) || ( isLeft() && vx < 0 )) {
            vx = 0;
          }
        }
      }

      if ( !overscroll.scrolling &&
        ovx === 0 && ovy === 0 && dx === 0 && dy === 0 && ( vx !== 0 || vy !== 0 )
      ) {
        onBeforeScroll();
      }

      if ( vx !== 0 || vy !== 0 ) {
        setScroll( scrollLeft + vx, scrollTop + vy );
        // if ( dx !== 0 || dy !== 0 ) {
        onScroll();
        // }
      }

      // 指定距离移动时：速度清空必须 setScroll 之后
      if ( dx === 0 && posX !== 0 ) {
        vx = 0;
        odx = 0;
        posX = 0;
        timePointX = 0;
      }
      if ( dy === 0 && posY !== 0 ) {
        vy = 0;
        ody = 0;
        posY = 0;
        timePointY = 0;
      }

      if ( overscroll.scrolling &&
        vx === 0 && vy === 0 && dx === 0 && dy === 0 && ( ovx !== 0 || ovy !== 0 )
      ) {
        setScroll();
        onAfterScroll();
      }

      // 用于计算滚动的开始和结束
      ovx = vx;
      ovy = vy;

      // 用于计算时间间隔
      lastTime = time;

    }).cancel );
    return {

      scrollMove: xory(( velocityX = 0, velocityY = 0 ) => {

        if ( vy > 0 !== velocityY > 0 ) {
          vy = 0;
        }
        if ( vx > 0 !== velocityX > 0 ) {
          vx = 0;
        }

        vy += sign( velocityY ) * getVelocity( abs( velocityY ));
        vy = sign( velocityY ) * getVelocity( abs( vy ));
        vx += sign( velocityX ) * getVelocity( abs( velocityX ));
        vx = sign( velocityX ) * getVelocity( abs( vx ));

      }),

      scrollTo: xory((
        positionX = overscroll.scrollLeft,
        positionY = overscroll.scrollTop
      ) => {

        // 一个动作没有结束是开始另一个动作
        if ( timePointX !== 0 || timePointY !== 0 ) {
          vx = 0;
          vy = 0;
          dx = 0;
          dy = 0;
          ovx = 0;
          ovy = 0;
          odx = 0;
          ody = 0;
          posX = 0;
          posY = 0;
          timePointX = 0;
          timePointY = 0;
        } else {
          onBeforeScroll();
        }
        const { scrollTop, scrollLeft } = overscroll;
        dx = positionX - scrollLeft;
        dy = positionY - scrollTop;
        posX = positionX;
        posY = positionY;
        odx = dx;
        ody = dy;
      }),

      scrollStop() {
        if ( vx !== 0 || vy !== 0 ) {
          onAfterScroll();
        }
        vx = 0;
        vy = 0;
        dx = 0;
        dy = 0;
        ovx = 0;
        ovy = 0;
        odx = 0;
        ody = 0;
        posX = 0;
        posY = 0;
        timePointX = 0;
        timePointY = 0;
        setScroll();
      }
    };
  }

  function runMouseAction({ scrollMove, scrollStop }) {
    const eventName = browser.firefox ? 'DOMMouseScroll' : 'mousewheel';
    handleDestroy( addEventListener( target, 'mousedown', scrollStop ).remove );
    handleDestroy( addEventListener( isPageScroll ? html : target, eventName, ( event ) => {
      const { deltaY, deltaX, shiftKey } = event;
      const targetScrollable = scrollable( event.target );
      const targetUnscrollableY = ( !targetScrollable.top && deltaY >= 0 ) ||
        ( !targetScrollable.bottom && deltaY <= 0 );
      const targetUnscrollableX = ( !targetScrollable.left && -deltaX >= 0 ) ||
        ( !targetScrollable.right && -deltaX <= 0 );
      const scrollTop = overscroll.scrollTop;
      const scrollLeft = overscroll.scrollLeft;
      let x = scrollLeft;
      let y = scrollTop;
      if ( !targetUnscrollableX ) {
        x = deltaX;
      }
      if ( !targetUnscrollableY ) {
        y = -deltaY;
      }
      if ( x !== scrollLeft || y !== scrollTop ) {
        resetCache( scope );
        scrollMove( shiftKey && x === 0 ? y : x, y );
        event.preventDefault();
        event.stopPropagation();
      }
    }).remove );
  }

  function runHammer({ scrollMove, scrollStop }) {
    let handleTarget;
    let lastDeltaX;
    let lastDeltaY;
    const manager = new Hammer.Manager( target );
    manager.add( new Hammer.Pan({ direction: Hammer.DIRECTION_ALL, threshold: 0 }));
    manager.on( 'panstart panmove panend', ( event ) => {
      event.preventDefault();

      if ( !dragable && event.pointerType === 'mouse' ) {
        return;
      }

      if ( !touchable && event.pointerType === 'touch' ) {
        return;
      }

      const { type, velocityY, velocityX, deltaX, deltaY } = event;
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
      } else if ( type === 'panend' ) {
        handleTarget = null;
        if ( !targetUnscrollableX ) {
          x = -velocityX * 20;
        }
        if ( !targetUnscrollableY ) {
          y = -velocityY * 20;
        }
        if ( x !== scrollLeft || y !== scrollTop ) {
          scrollMove( x, y );
        } else if ( overscroll.scrolling ) {
          onAfterScroll();
        }
      }

      // panmove
      else {
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
    handleDestroy(() => manager.destroy());

    if ( touchable ) {
      handleDestroy( addEventListener( target, 'touchstart', scrollStop ).remove );
    }

  }

  return {
    run() {
      resetCache( scope );
      const anim = runAnimFrame();
      runMouseAction( anim );
      if ( dragable || touchable ) {
        runHammer( anim );
      }
      return {
        scrollTo( positionX, positionY, noAnimation ) {
          resetCache( scope );
          if ( noAnimation === true ) {
            setScroll( positionX, positionY );
            return;
          }
          anim.scrollStop();
          anim.scrollTo( positionX, positionY );
        },
        position() {
          const { left, top } = getScroll();
          return {
            scrollTop: top,
            scrollLeft: left
          };
        }
      };
    }
  };
};
