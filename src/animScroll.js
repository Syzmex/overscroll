
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
  if (( t /= d / 2 ) < 1 ) return c / 2 * t * t + b;
  return -c / 2 * (( --t ) * ( t - 2 ) - 1 ) + b;
};

export default ( scope ) => {

  const { handleDestroy, overscroll, hasScrollY, target, html,
    onScroll, isPageScroll, getNearestScrollable, resetCache, canScroll,
    isTop, isBottom, isLeft, isRight, getFromRange, hasScrollX, onBeforeScroll,
    onAfterScroll, scrollX, scrollY } = scope;

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
  const round = Math.round;
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
          const start = posY - ody;
          const deltaDy = sign( ody ) * round( easeInOut( timePointY, 0, abs( ody ), 1 ));
          dy = round( ody - deltaDy );
          vy = deltaDy - ( scrollTop - start );
          // 向下/向上
          if (( isBottom() && vy > 0 ) || ( isTop() && vy < 0 )) {
            vy = 0;
          }
          timePointY += ( time - lastTime ) / 1000;
        }
        if ( hasScrollX() && dx !== 0 ) {
          const start = posX - odx;
          const deltaDx = sign( odx ) * round( easeInOut( timePointX, 0, abs( odx ), 1 ));
          dx = round( odx - deltaDx );
          vx = deltaDx - ( scrollLeft - start );
          // 向右/向左
          if (( isRight() && vx > 0 ) || ( isLeft() && vx < 0 )) {
            vx = 0;
          }
          timePointX += ( time - lastTime ) / 1000;
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

      // 滚动开始和结束
      // if ( ovx === 0 && ovy === 0 && ( vx !== 0 || vy !== 0 )) {
      //   onBeforeScroll.call( target, { ...overscroll });
      // }

      if ( vx !== 0 || vy !== 0 ) {
        setScroll( scrollLeft + vx, scrollTop + vy );
        onScroll.call( target, { ...overscroll });
      }

      // 指定距离移动时：速度清空必须在设置滚动之后
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

      if ( vx === 0 && vy === 0 && ( ovx !== 0 || ovy !== 0 ) && ( dx === 0 && dy === 0 )) {
        onAfterScroll.call( target, { ...overscroll });
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
          onBeforeScroll.call( target, { ...overscroll });
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
          onAfterScroll.call( target, { ...overscroll });
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
      const nearest = getNearestScrollable( event.target );
      const targetCantTo = canScroll( target );
      const canTo = nearest === target ? targetCantTo : canScroll( nearest );
      const cantscroll =
        ( !canTo.top && deltaY > 0 ) ||
        ( !canTo.bottom && deltaY < 0 ) ||
        ( !canTo.left && -deltaX > 0 ) ||
        ( !canTo.right && -deltaX < 0 );
      const targetCantscroll =
        ( !targetCantTo.top && deltaY > 0 ) ||
        ( !targetCantTo.bottom && deltaY < 0 ) ||
        ( !targetCantTo.left && -deltaX > 0 ) ||
        ( !targetCantTo.right && -deltaX < 0 );

      // 子元素可以滚动，仅判断上下滚动的冒泡
      if ( nearest !== target && cantscroll && !targetCantscroll ) {
        resetCache( scope );
        // 按住 shift x方向滚动
        scrollMove( shiftKey && deltaX === 0 ? -deltaY : deltaX, -deltaY );
        event.preventDefault();
        event.stopPropagation();
      } else if ( nearest === target && !cantscroll ) {
        resetCache( scope );
        scrollMove( shiftKey && deltaX === 0 ? -deltaY : deltaX, -deltaY );
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

      // 生产环境关闭鼠标拖动
      if ( process.env.NODE_ENV === 'production' && event.pointerType === 'mouse' ) {
        return;
      }

      let x = 0;
      let y = 0;
      const { type, velocityY, velocityX, deltaX, deltaY } = event;
      const nearest = handleTarget || getNearestScrollable( event.target );
      const targetCantTo = canScroll( target );
      const canTo = nearest === target ? targetCantTo : canScroll( nearest );
      const cantscrollX = ( !canTo.left && velocityX > 0 ) || ( !canTo.right && velocityX < 0 );
      const cantscrollY = ( !canTo.top && velocityY > 0 ) || ( !canTo.bottom && velocityY < 0 );
      const targetCantscrollX = ( !targetCantTo.left && velocityX > 0 ) || ( !targetCantTo.right && velocityX < 0 );
      const targetCantscrollY = ( !targetCantTo.top && velocityY > 0 ) || ( !targetCantTo.bottom && velocityY < 0 );
      const scrollTop = overscroll.scrollTop;
      const scrollLeft = overscroll.scrollLeft;
      if ( type === 'panstart' ) {
        resetCache( scope );
        lastDeltaX = 0;
        lastDeltaY = 0;
        handleTarget = nearest;
        onBeforeScroll.call( target, { ...overscroll });
      } else if ( type === 'panend' ) {
        handleTarget = null;
        if (
          ( nearest !== target && cantscrollX && !targetCantscrollX ) ||
          ( nearest === target && !targetCantscrollX )
        ) {
          x = -velocityX * 20;
        }
        if (
          ( nearest !== target && cantscrollY && !targetCantscrollY ) ||
          ( nearest === target && !targetCantscrollY )
        ) {
          y = -velocityY * 20;
        }
        if ( x !== 0 || y !== 0 ) {
          scrollMove( x, y );
        } else {
          onAfterScroll.call( target, { ...overscroll });
        }
      } else if ( nearest === target ) {
        if ( !targetCantscrollX ) {
          x = scrollLeft - ( deltaX - lastDeltaX );
        }
        if ( !targetCantscrollY ) {
          y = scrollTop - ( deltaY - lastDeltaY );
        }
        if ( x !== 0 || y !== 0 ) {
          setScroll( x, y );
          onScroll.call( target, { ...overscroll });
        }
      } else {
        if ( cantscrollX && !targetCantscrollX ) {
          x = scrollLeft - ( deltaX - lastDeltaX );
        }
        if ( cantscrollY && !targetCantscrollY ) {
          y = scrollTop - ( deltaY - lastDeltaY );
        }
        if ( x !== 0 || y !== 0 ) {
          setScroll( x, y );
          onScroll.call( target, { ...overscroll });
        }
      }
      lastDeltaX = deltaX;
      lastDeltaY = deltaY;
    });
    handleDestroy(() => manager.destroy());
    handleDestroy( addEventListener( target, 'touchstart', scrollStop ).remove );
  }

  return {
    run() {
      resetCache( scope );
      const anim = runAnimFrame();
      runMouseAction( anim );
      runHammer( anim );
      return anim;
    }
  };
};
