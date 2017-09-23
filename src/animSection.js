
import is from 'whatitis';
import Hammer from 'hammerjs';
import { set } from './utils/css';
import addEventListener from './utils/dom/addDomEventListener';
import { requestAnimFrame } from './utils/requestAnimationFrame';

function sign( number ) {
  return number > 0 ? 1 : -1;
}

const boundOut = ( t ) => Math.sin( Math.PI * t );
const esseOut = ( t ) => {
  return t < 0.5 ? 1.5 : Math.sin( Math.PI * t ) * 1.5 * 29 / 30 + 1 / 30;
};
const divisor = ( d, S ) => esseOut((( S - d ) / S ));
const bound = ( d, S ) => boundOut((( S - d ) / S ));

const abs = Math.abs;
const max = Math.max;

export default ( scope ) => {

  const { scrollX, scrollY, handleDestroy, overscroll, hasScrollY, hasScrollX,
    setScroll, target, switchScale, anchors, getPosition, getNearestScrollable,
    resetCache, getScroll, canScroll, onScroll, onAfterScroll, onBeforeScroll } = scope;

  const frame = ( v, d, s, rebound ) => {
    if ( v > 0 !== d > 0 ) {
      rebound = true;
      v += sign( d ) * max( 0.5, 10 * bound( abs( d ), s ));
      d -= v;
    } else if ( rebound ) {
      v = sign( d ) * max( 0.5, 30 * bound( abs( d ), s ));
      d = sign( d ) * max( abs( d ) - abs( v ), 0 );
    } else {
      v = sign( d ) * max( 0.5, 30 * divisor( abs( d ), s ));
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
    let ovx = 0;
    let ovy = 0;
    let reboundX = false;
    let reboundY = false;

    // let vx = 0;
    // let vy = 0;
    // let dx = 0;
    // let dy = 0;

    // let odx = 0;
    // let ody = 0;
    // let posX = 0;
    // let posY = 0;
    // let lastTime = 0;
    // let timePointX = 0;
    // let timePointY = 0;
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

      if ( vx !== 0 || vy !== 0 ) {
        setScroll( scrollLeft + vx, scrollTop + vy );
        onScroll.call( target, { ...overscroll });
      }

      if ( dy === 0 ) {
        reboundY = false;
        vy = 0;
      }
      if ( dx === 0 ) {
        reboundX = false;
        vx = 0;
      }

      if ( vx === 0 && vy === 0 && ( ovx !== 0 || ovy !== 0 ) && ( dx === 0 && dy === 0 )) {
        onAfterScroll.call( target, { ...overscroll });
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
        } else {
          reboundY = false;
          vy = velocity;
          dy = distance;
        }
      },
      scrollTo( position ) {

      },
      scrollStop() {
        vx = 0;
        vy = 0;
        dx = 0;
        dy = 0;
        reboundX = false;
        reboundY = false;
        setScroll();
      }
    };
  };

  function getYPoss() {
    const { top: scrollTop } = getScroll();
    return anchors.map( getPosition ).map(({ top }) => top + scrollTop );
  }

  function getXPoss() {
    const { left: scrollLeft } = getScroll();
    return anchors.map( getPosition ).map(({ left }) => left + scrollLeft );
  }

  function initSections() {
    anchors.forEach(( element ) => {
      set( element, 'height', '100%' );
      set( element, 'width', '100%' );
    });
  }

  function runHammer({ scrollMove, scrollStop }) {
    let possX;
    let possY;
    // let scrollLeft;
    // let scrollTop;
    let curAngle;
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

    mc.add( new Hammer.Pan({ direction: Hammer.DIRECTION_ALL, threshold: 0 }));
    mc.on( 'panstart panmove panend', ( event ) => {
      event.preventDefault();

      // 生产环境关闭鼠标拖动
      if ( process.env.NODE_ENV === 'production' && event.pointerType === 'mouse' ) {
        return;
      }

      let x = 0;
      let y = 0;
      const { type, angle, velocityY, velocityX, deltaX, deltaY, offsetDirection } = event;
      const rightDirection = ( scrollY ? directionY : directionX ).includes( offsetDirection );
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
        curAngle = angle;
        lastDeltaX = 0;
        lastDeltaY = 0;
        handleTarget = nearest;
        onBeforeScroll.call( target, { ...overscroll });
      } else if ( type === 'panend' && scrollY ) {
        possY = getYPoss( scope );
        const { clientHeight } = overscroll;
        const { deltaY, velocityY } = event;
        const nearestpos = possY.reduce(( pos, top ) => {
          return top > scrollTop && top < clientHeight + scrollTop ? top : pos;
        }, 0 );
        if ( nearestpos !== 0 ) {
          sectionMoving( velocityY, nearestpos, scrollTop, clientHeight, deltaY );
          // // 初速度足够触发上下滑动
          // if ( velocityY > 0.5 ) { // 下滑
          //   scrollMove( -velocityY * 20, nearestpos - ( scrollTop + clientHeight ));
          // } else if ( velocityY < -0.5 ) { // 上滑
          //   scrollMove( -velocityY * 20, nearestpos - scrollTop );
          // }
          // // 靠近上方
          // else if ( nearestpos - scrollTop < downScale * clientHeight ) {
          //   scrollMove( -velocityY * 20, nearestpos - scrollTop );
          // }
          // // 靠近下方
          // else if ( clientHeight + scrollTop - nearestpos < upScale * clientHeight ) {
          //   scrollMove( -velocityY * 20, nearestpos - ( scrollTop + clientHeight ));
          // }
          // // 在中间位置
          // else if ( deltaY > 0 ) {
          //   scrollMove( -velocityY * 20, nearestpos - ( scrollTop + clientHeight ));
          // } else if ( deltaY < 0 ) {
          //   scrollMove( -velocityY * 20, nearestpos - scrollTop );
          // } else if ( nearestpos - scrollTop > clientHeight / 2 ) {
          //   scrollMove( 0, nearestpos - ( scrollTop + clientHeight ));
          // } else {
          //   scrollMove( 0, nearestpos - scrollTop );
          // }
        }
      } else if ( type === 'panend' && scrollX ) {
        possX = getXPoss( scope );
        const { clientWidth } = overscroll;
        const { deltaX, velocityX } = event;
        const nearestpos = possX.reduce(( pos, left ) => {
          return left > scrollLeft && left < clientWidth + scrollLeft ? left : pos;
        }, 0 );
        if ( nearestpos !== 0 ) {
          sectionMoving( velocityX, nearestpos, scrollLeft, clientWidth, deltaX );
        }
      } else if ( nearest === target && rightDirection ) {
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
      } else if ( rightDirection ) {
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
    handleDestroy(() => mc.destroy());
    handleDestroy( addEventListener( target, 'touchstart', scrollStop ).remove );
  }

  return {
    run() {
      resetCache( scope );
      initSections();
      const anim = runAnimFrame();
      runHammer( anim );
      return anim;
    }
  };
};
