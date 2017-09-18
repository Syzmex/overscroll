
import is from 'whatitis';
import Hammer from 'hammerjs';
import { set, get } from './utils/css';
import browser from './utils/browser';
import compose from './utils/compose';
import getScope from './utils/scope';
import domUtils, { getParent } from './utils/dom';
import addEventListener from './utils/dom/addDomEventListener';
import { requestAnimFrame } from './utils/requestAnimationFrame';


function sign( number ) {
  return number > 0 ? 1 : -1;
}

function toFixed( number, digit ) {
  return Math.round( number * ( 10 ** digit )) / ( 10 ** digit );
}

function handleDestory( options ) {
  options.destroy = null;
  return function( callback ) {
    options.destroy = options.destroy ? compose( options.destroy, callback ) : callback;
  };
}

function OverScroll( options ) {

  const { OVERSCROLL, OVERSCROLLX, OVERSCROLLY, hasX, hasY, getScroll,
    target, axis, win, mode, isPageScroll } = options;

  const overscroll = {
    scrollTop: 0,
    scrollLeft: 0,
    scrollHeight: 0,
    scrollWidth: 0,
    destroy: null
  };

  const onDestroy = handleDestory( options );
  const { domData, getPosition, getClientSize, getScrollSize, getFromRange,
    hasScrollY } = domUtils( options );
  const { setData, hasData, removeData } = domData;
  set( target, 'overflow', 'hidden' );
  setData( target, OVERSCROLL );
  if ( hasX( axis )) {
    setData( target, OVERSCROLLX );
  }
  if ( hasY( axis )) {
    setData( target, OVERSCROLLY );
  }

  function isTop() {
    return overscroll.scrollTop <= 1;
  }

  function isBottom() {
    return overscroll.scrollTop === overscroll.scrollHeight - overscroll.clientHeight;
  }

  function isLeft() {
    return overscroll.scrollLeft <= 1;
  }

  function isRight() {
    return overscroll.scrollLeft === overscroll.scrollWidth - overscroll.clientWidth;
  }

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

  const setPositionX = handleState([ 'scrollLeft', 'scrollRight', 'scrollX' ]);
  const setPositionY = handleState([ 'scrollTop', 'scrollBottom', 'scrollY' ]);
  const setAnimationX = handleState(['scrollingX']);
  const setAnimationY = handleState(['scrollingY']);
  const setDirectionX = handleState([ 'scrollingLeft', 'scrollingRight' ]);
  const setDirectionY = handleState([ 'scrollingUp', 'scrollingDown' ]);

  function setScrollState({ target }) {
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
  }

  function getNearestScrollble( dom ) {
    return hasScrollY( dom ) ? dom : getParent( dom, hasScrollY );
  }

  function setScroll(
    scrollLeft = overscroll.scrollLeft,
    scrollTop = overscroll.scrollTop
  ) {
    // 取出滚动区域大小和可视范围计算滚动位置
    const { scrollHeight, scrollWidth, clientWidth, clientHeight } = overscroll;
    const scrollLeftRange = getFromRange( 0, scrollWidth - clientWidth );
    const scrollTopRange = getFromRange( 0, scrollHeight - clientHeight );
    overscroll.scrollLeft = scrollLeftRange( scrollLeft );
    overscroll.scrollTop = scrollTopRange( scrollTop );
    setScrollState( options );
    if ( isPageScroll ) {
      win.scrollTo( overscroll.scrollLeft, overscroll.scrollTop );
    } else {
      options.target.scrollTop = overscroll.scrollTop;
      options.target.scrollLeft = overscroll.scrollLeft;
    }
  }

  function reset() {
    const { top, left } = getScroll();
    const { width: scrollWidth, height: scrollHeight } = getScrollSize();
    const { width: clientWidth, height: clientHeight } = getClientSize();
    overscroll.scrollTop = top;
    overscroll.scrollLeft = left;
    overscroll.scrollWidth = scrollWidth;
    overscroll.scrollHeight = scrollHeight;
    overscroll.clientWidth = clientWidth;
    overscroll.clientHeight = clientHeight;
  }

  const registerScrollMove = ({ target }) => {
    let v = 0;
    const a = ( v ) => {
      return v > 30 ? 1.5 : ( 1 - Math.cos( Math.PI * v / 30 )) / 2 * 1.5 * 29 / 30 + 1 / 30;
    };
    let lastTime = 0;
    const getVelocity = getFromRange( 2, 50 );
    onDestroy( requestAnimFrame(( time ) => {
      const { scrollLeft, scrollTop } = overscroll;
      if ( v === 0 ) {
        setAnimationY( target );
        setDirectionY( target );
      }
      if ( lastTime === 0 ) {
        reset( options );
      } else if ( hasScrollY() && v !== 0 ) {
        v = sign( v ) * Math.max( 0, Math.abs( v ) - a( Math.abs( v )));
        setAnimationY( target, 'scrollingY' );
        setDirectionY( target, v > 0 ? 'scrollingDown' : 'scrollingUp' );
        setScroll( scrollLeft, scrollTop + v );
      }
      lastTime = time;
    }).cancel );
    return {
      scrollMove( velocity ) {
        if ( v > 0 !== velocity > 0 ) {
          v = 0;
        }
        v += sign( velocity ) * getVelocity( Math.abs( velocity ));
        v = sign( velocity ) * getVelocity( Math.abs( v ));
      },
      scrollStop() {
        v = 0;
      }
    };
  };

  const registerSectionMove = () => {
    let v = 0;
    let d = 0;
    const boundOut = ( t ) => Math.sin( Math.PI * t );
    const esseOut = ( t ) => {
      return t < 0.5 ? 1.5 : Math.sin( Math.PI * t ) * 1.5 * 29 / 30 + 1 / 30;
    };
    const divisor = ( d, S ) => esseOut((( S - d ) / S ));
    const bound = ( d, S ) => boundOut((( S - d ) / S ));
    let rebound = false;
    onDestroy( requestAnimFrame(() => {
      const { scrollLeft, scrollTop, clientHeight } = overscroll;
      if ( v === 0 ) {
        setAnimationY( target );
        setDirectionY( target );
      }
      if ( hasScrollY() && d !== 0 ) {
        if ( v > 0 !== d > 0 ) {
          rebound = true;
          v += sign( d ) * Math.max( 0.5, 10 * bound( Math.abs( d ), clientHeight ));
          d -= v;
        } else if ( rebound ) {
          v = sign( d ) * Math.max( 0.5, 30 * bound( Math.abs( d ), clientHeight ));
          d = sign( d ) * Math.max( Math.abs( d ) - Math.abs( v ), 0 );
        } else {
          v = sign( d ) * Math.max( 0.5, 30 * divisor( Math.abs( d ), clientHeight ));
          d = sign( d ) * Math.max( Math.abs( d ) - Math.abs( v ), 0 );
        }
        setAnimationY( target, 'scrollingY' );
        setDirectionY( target, v > 0 ? 'scrollingDown' : 'scrollingUp' );
        setScroll( scrollLeft, scrollTop + v );
      }
      if ( d === 0 ) {
        rebound = false;
        v = 0;
      }
    }).cancel );
    return {
      scrollMove( velocity, distance ) {
        rebound = false;
        v = velocity;
        d = distance;
      },
      scrollStop() {
        rebound = false;
        v = 0;
        d = 0;
      }
    };
  };

  let scrollMove;
  let scrollStop;
  if ( mode === 'section' ) {
    const modeMove = registerSectionMove( options );
    scrollMove = modeMove.scrollMove;
    scrollStop = modeMove.scrollStop;
  }

  if ( mode === 'scroll' ) {
    const modeMove = registerScrollMove( options );
    scrollMove = modeMove.scrollMove;
    scrollStop = modeMove.scrollStop;
  }

  function addMouseWheelEvent({ target, html, onScroll, isPageScroll }) {
    const eventName = browser.firefox ? 'DOMMouseScroll' : 'mousewheel';
    onDestroy( addEventListener( target, 'mousedown', scrollStop ).remove );
    onDestroy( addEventListener( isPageScroll ? html : target, eventName, ( event ) => {
      const { deltaY } = event;
      const { top, left } = getScroll();
      const scrollble = getNearestScrollble( event.target );
      if ( scrollble === target ) {
        reset({ target });
        scrollMove( -deltaY );
        if ( !isPageScroll ) {
          if ( isTop() && deltaY > 0 ) {
            // event.stopPropagation();
          } else if ( isBottom() && deltaY < 0 ) {
            // event.stopPropagation();
          } else {
            event.preventDefault();
            event.stopPropagation();
          }
        }
        if ( is.Function( onScroll )) {
          onScroll.call( target, top, left, event );
        }
      }
    }).remove );
  }

  function addHammerScroll({ target }) {
    let scrollLeft;
    let scrollTop;
    const manager = new Hammer.Manager( target );
    manager.add( new Hammer.Pan({ direction: Hammer.DIRECTION_ALL, threshold: 0 }));
    manager.on( 'panstart panmove panend', ( event ) => {
      event.preventDefault();
      const { type, deltaY } = event;
      const overscroll = getNearestScrollble( event.target );
      if ( overscroll === target ) {
        if ( type === 'panstart' ) {
          reset( options );
          scrollLeft = overscroll.scrollLeft;
          scrollTop = overscroll.scrollTop;
        } else if ( type === 'panend' ) {
          scrollMove( -event.velocityY * 20 );
        } else if ( deltaY !== 0 ) {
          setScroll( scrollLeft, scrollTop - deltaY );
        }
      }
    });
    onDestroy(() => manager.destroy());
    onDestroy( addEventListener( target, 'touchstart', scrollStop ).remove );
  }

  if ( mode === 'scroll' ) {
    addHammerScroll( options );
    addMouseWheelEvent( options );
  }

  function getPoss({ anchors }) {
    const { top: scrollTop } = getScroll();
    return anchors.map( getPosition ).map(({ top }) => top + scrollTop );
  }

  function initSections({ target, anchors }) {
    set( target, 'height', '100%' );
    anchors.forEach(( element ) => {
      set( element, 'height', '100%' );
    });
  }

  function addHammerSection({ target, switchScale }) {
    let poss;
    let scrollLeft;
    let scrollTop;
    const [ upScale, downScale ] = switchScale;
    const mc = new Hammer.Manager( target );
    mc.add( new Hammer.Pan({ direction: Hammer.DIRECTION_ALL, threshold: 0 }));
    mc.on( 'panstart panmove panend', ( event ) => {
      event.preventDefault();
      const { type, deltaY } = event;
      const overscroll = getNearestScrollble( event.target );
      if ( overscroll === target ) {
        if ( type === 'panstart' ) {
          reset( options );
          scrollLeft = overscroll.scrollLeft;
          scrollTop = overscroll.scrollTop;
        } else if ( type === 'panend' ) {
          reset( options );
          poss = getPoss( options );
          const { clientHeight } = overscroll;
          scrollLeft = overscroll.scrollLeft;
          scrollTop = overscroll.scrollTop;
          const { deltaY, velocityY } = event;
          const nearest = poss.reduce(( line, top ) => {
            return top > scrollTop && top < clientHeight + scrollTop ? top : line;
          }, 0 );
          if ( nearest !== 0 ) {
            // 初速度足够触发上下滑动
            if ( velocityY > 0.5 ) { // 下滑
              scrollMove( -velocityY * 20, nearest - ( scrollTop + clientHeight ));
            } else if ( velocityY < -0.5 ) { // 上滑
              scrollMove( -velocityY * 20, nearest - scrollTop );
            }
            // 靠近上方
            else if ( nearest - scrollTop < downScale * clientHeight ) {
              scrollMove( -velocityY * 20, nearest - scrollTop );
            }
            // 靠近下方
            else if ( clientHeight + scrollTop - nearest < upScale * clientHeight ) {
              scrollMove( -velocityY * 20, nearest - ( scrollTop + clientHeight ));
            }
            // 在中间位置
            else if ( deltaY > 0 ) {
              scrollMove( -velocityY * 20, nearest - ( scrollTop + clientHeight ));
            } else if ( deltaY < 0 ) {
              scrollMove( -velocityY * 20, nearest - scrollTop );
            } else if ( nearest - scrollTop > clientHeight / 2 ) {
              scrollMove( 0, nearest - ( scrollTop + clientHeight ));
            } else {
              scrollMove( 0, nearest - scrollTop );
            }
          }
        } else if ( deltaY !== 0 ) {
          setScroll( scrollLeft, scrollTop - deltaY );
        }
      }
    });
    onDestroy(() => mc.destroy());
    onDestroy( addEventListener( target, 'touchstart', scrollStop ).remove );
  }

  if ( mode === 'section' ) {
    initSections( options );
    addHammerSection( options );
  }

  return {
    destroy: overscroll.destroy
  };
}

export default compose( OverScroll, getScope );
