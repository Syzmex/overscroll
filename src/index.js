
import is from 'whatitis';
import Hammer from 'hammerjs';
import { set } from './utils/css';
import browser from './utils/browser';
import compose from './utils/compose';
import domUtils from './utils/dom';
import scope from './utils/scope';
import hasScrollBar from './utils/hasScrollBar';
import addEventListener from './utils/dom/addDomEventListener';
import { requestAnimFrame } from './utils/requestAnimationFrame';

const {
  X, Y, XY, xreg, yreg, OVERSCROLLJS, hasX, hasY, hasXY, getAxis, getDocument, // eslint-disable-line
  getWindow, getScrollByAxis // eslint-disable-line
} = scope;

const defaultOptions = {
  axis: XY,
  prefix: OVERSCROLLJS,
  thumbMiniSize: 20,
  show: true,
  showX: true,
  showY: true,
  target: null,
  watchInterval: 100,
  watch: null,
  onScroll: null,
  getContainer: null,
  isPageScroll: false,
  mode: 'scroll', // 'section'
  anchors: null,
  switchScale: [ 0.2, 0.2 ] // [往上拉的距离比例，往下拉的距离比例]
};

function getOptions({
  axis,
  prefix,
  show,
  showX,
  showY,
  target,
  watchInterval,
  watch,
  onScroll,
  getContainer,
  mode,
  anchors,
  switchScale
} = {}) {

  const options = Object.assign({}, defaultOptions );
  const doc = getDocument( target );
  const win = getWindow( doc );
  const body = doc.body;
  const html = doc.documentElement;

  // 滚动容器
  if ( is.Undefined( target ) || [ html, body ].includes( target )) {
    options.target = doc.scrollingElement || body;
    options.isPageScroll = true;
  }

  // 元素装载容器
  if ( options.target === html ) {
    options.container = options.target === html ? body : options.target;
  } else {
    options.target = target;
  }

  // container => containerX containerY
  if ( is.Function( getContainer )) {
    const container = getContainer();
    if ( is.Element( container )) {
      options.containerX = container;
      options.containerY = container;
    } else {
      const { x, y, X, Y } = container;
      options.containerX = x || X;
      options.containerY = y || Y || options.containerX;
    }
  } else {
    options.containerX = options.container;
    options.containerY = options.containerX;
  }

  // 滚动条 计算
  // axis => scrollX scrollY
  options.axis = getAxis( axis );
  options.scrollX = hasX( options.axis );
  options.scrollY = hasY( options.axis );

  // 滚动条 显示/隐藏
  // show => showX showY
  options.show = show !== false;
  options.showX = options.show && showX !== false;
  options.showY = options.show && showY !== false;

  // 样式前缀 prefix
  if ( is.String( prefix )) {
    options.prefix = prefix;
  }

  // 事件
  // onScroll( scrollTop, scrollLeft )
  if ( is.Function( onScroll )) {
    options.onScroll = onScroll;
  }

  if ( is.Function( watch )) {
    options.watch = watch;
    if ( is.Number( watchInterval ) && watchInterval > 50 ) {
      options.watchInterval = watchInterval;
    }
  }

  if ( mode === 'section' && is.Array( anchors ) && anchors.every( is.Element )) {
    options.mode = mode;
    options.anchors = anchors;
    if ( is.String( switchScale ) && /^\d*$/.test( switchScale )) {
      switchScale = [ parseFloat( switchScale ), parseFloat( switchScale ) ];
    }
    if ( is.Number( switchScale )) {
      switchScale = [ switchScale, switchScale ];
    }
    if (
      is.Array( switchScale ) &&
      anchors.every(( num ) => is.Number( num ) && num <= 1 && num >= 0 )
    ) {
      options.switchScale = [].concat( switchScale );
    }
  }

  return Object.assign( options, { body, html, doc, win });
}


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

  const overscroll = {
    scrollTop: 0,
    scrollLeft: 0,
    scrollHeight: 0,
    scrollWidth: 0,
    destroy: null
  };
  const onDestroy = handleDestory( options );

  const { win, mode, isPageScroll } = options;
  const { /* hasScroll, hasScrollX, */hasScrollY } = hasScrollBar( options );
  const { getPosition, getClientSize, getScrollSize, getFromRange } = domUtils( options );
  const getScroll = getScrollByAxis( options );
  set( options.target, 'overflow', 'hidden' );

  function isTop() {
    return overscroll.scrollTop <= 1;
  }

  function isBottom() {
    return overscroll.scrollTop === overscroll.scrollHeight;
  }

  // function isLeft() {
  //   return overscroll.scrollLeft <= 1;
  // }

  // function isRight() {
  //   return overscroll.scrollLeft === overscroll.scrollWidth;
  // }

  function setScroll(
    scrollLeft = overscroll.scrollLeft,
    scrollTop = overscroll.scrollTop
  ) {
    overscroll.scrollLeft = getFromRange( 0, overscroll.scrollWidth - overscroll.clientWidth )( scrollLeft );
    overscroll.scrollTop = getFromRange( 0, overscroll.scrollHeight - overscroll.clientHeight )( scrollTop );
    if ( isPageScroll ) {
      win.scrollTo( overscroll.scrollLeft, overscroll.scrollTop );
    } else {
      options.target.scrollTop = overscroll.scrollTop;
      options.target.scrollLeft = overscroll.scrollLeft;
    }
  }

  function reset({ target }) {
    const { top, left } = getScroll( target );
    const { width: scrollWidth, height: scrollHeight } = getScrollSize();
    const { width: clientWidth, height: clientHeight } = getClientSize();
    overscroll.scrollTop = top;
    overscroll.scrollLeft = left;
    overscroll.scrollWidth = scrollWidth;
    overscroll.scrollHeight = scrollHeight;
    overscroll.clientWidth = clientWidth;
    overscroll.clientHeight = clientHeight;
  }

  const registerScrollMove = () => {
    let v = 0;
    const a = ( v ) => {
      return v > 30 ? 1.5 : ( 1 - Math.cos( Math.PI * v / 30 )) / 2 * 1.5 * 29 / 30 + 1 / 30;
    };
    let lastTime = 0;
    const getVelocity = getFromRange( 2, 50 );
    onDestroy( requestAnimFrame(( time ) => {
      const { scrollLeft, scrollTop } = overscroll;
      if ( lastTime === 0 ) {
        reset( options );
      } else if ( hasScrollY() && Math.abs( v ) > 0 ) {
        v = sign( v ) * toFixed( Math.max( 0, Math.abs( v ) - a( Math.abs( v ))), 2 );
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
      if ( hasScrollY() && d !== 0 ) {
        if ( v > 0 !== d > 0 ) {
          rebound = true;
          v += ( d > 0 ? 1 : -1 ) * Math.max( 0.5, 10 * bound( Math.abs( d ), clientHeight ));
          d -= v;
        } else if ( rebound ) {
          v = ( d > 0 ? 1 : -1 ) * Math.max( 0.5, 30 * bound( Math.abs( d ), clientHeight ));
          d = ( d > 0 ? 1 : -1 ) * Math.max( Math.abs( d ) - Math.abs( v ), 0 );
        } else {
          v = ( d > 0 ? 1 : -1 ) * Math.max( 0.5, 30 * divisor( Math.abs( d ), clientHeight ));
          d = ( d > 0 ? 1 : -1 ) * Math.max( Math.abs( d ) - Math.abs( v ), 0 );
        }
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

  function addMouseWheelEvent({ target, html, onScroll }) {
    const eventName = browser.firefox ? 'DOMMouseScroll' : 'mousewheel';
    onDestroy( addEventListener( html, 'mousedown', scrollStop ).remove );
    onDestroy( addEventListener( isPageScroll ? html : target, eventName, ( event ) => {
      const { deltaY } = event;
      const { top, left } = getScroll( target );
      scrollMove( deltaY );
      if ( !isPageScroll ) {
        if ( !isTop() && !isBottom()) {
          event.preventDefault();
        }
        event.stopPropagation();
      }
      if ( is.Function( onScroll )) {
        onScroll.call( target, top, left, event );
      }
    }).remove );
  }

  function addHammerScroll({ html, target }) {
    let scrollLeft;
    let scrollTop;
    const mc = new Hammer.Manager( target );
    mc.add( new Hammer.Pan({ direction: Hammer.DIRECTION_ALL, threshold: 0 }));
    mc.on( 'panstart panmove panend', ( event ) => {
      event.preventDefault();
      const { type, deltaY, pointers } = event;
      if ( type === 'panstart' && pointers.length === 1 ) {
        reset( options );
        scrollLeft = overscroll.scrollLeft;
        scrollTop = overscroll.scrollTop;
      } else if ( type === 'panend' ) {
        const { velocityY } = event;
        scrollMove( -velocityY * 20 );
      } else if ( deltaY !== 0 ) {
        setScroll( scrollLeft, scrollTop - deltaY );
      }
    });
    onDestroy(() => mc.destroy());
    onDestroy( addEventListener( html, 'touchstart', scrollStop ).remove );
  }

  if ( mode === 'scroll' ) {
    registerScrollMove( options );
    addHammerScroll( options );
    addMouseWheelEvent( options );
  }

  function getPoss({ target, anchors }) {
    const { top: scrollTop } = getScroll( target );
    return anchors.map( getPosition ).map(({ top }) => top + scrollTop );
  }

  function initSections({ target, anchors }) {
    set( target, 'height', '100%' );
    anchors.forEach(( element ) => {
      set( element, 'height', '100%' );
    });
  }

  function addHammerSection({ html, target, switchScale }) {
    let poss;
    let scrollLeft;
    let scrollTop;
    const [ upScale, downScale ] = switchScale;
    const mc = new Hammer.Manager( target );
    mc.add( new Hammer.Pan({ direction: Hammer.DIRECTION_ALL, threshold: 0 }));
    mc.on( 'panstart panmove panend', ( event ) => {
      event.preventDefault();
      const { type, deltaY } = event;
      if ( type === 'panstart' ) {
        reset( options );
        scrollLeft = overscroll.scrollLeft;
        scrollTop = overscroll.scrollTop;
      } else if ( type === 'panend' ) {
        reset( options );
        poss = getPoss( options );console.log(poss)
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
    });
    onDestroy(() => mc.destroy());
    onDestroy( addEventListener( html, 'touchstart', scrollStop ).remove );
  }

  if ( mode === 'section' ) {
    initSections( options );
    addHammerSection( options );
  }

  return {
    destroy: overscroll.destroy
  };
}

export default compose( OverScroll, getOptions );
