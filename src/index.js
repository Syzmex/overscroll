
import is from 'whatitis';
import Hammer from 'hammerjs';
import { get, set } from './utils/css';
import browser from './utils/browser';
import compose from './utils/compose';
import domUtils from './utils/dom';
// import { hasScroll, hasScrollX, hasScrollY } from './utils/hasScrollBar';
import addEventListener from './utils/dom/addDomEventListener';
import { requestAnimFrame } from './utils/requestAnimationFrame';

const X = 'x';
const Y = 'y';
const XY = 'xy';
const xreg = /x/i;
const yreg = /y/i;
const OVERSCROLLJS = 'overscrolljs';

function hasX( axis ) {
  return xreg.test( axis );
}

function hasY( axis ) {
  return yreg.test( axis );
}

function hasXY( axis ) {
  return hasX( axis ) && hasY( axis );
}

function getAxis( axis ) {
  if ( hasXY( axis )) {
    return XY;
  } else if ( hasX( axis )) {
    return X;
  }
  return Y;
}

function getDocument( dom ) {
  return is.Element( dom ) ? dom.ownerDocument : document;
}

function getWindow( dom ) {
  const doc = is.Document( dom ) ? dom : getDocument( dom );
  return doc.defaultView || window;
}

const getScrollByAxis = ({ axis, win, html, body, isPageScroll }) => ( target ) => {
  // CSS1Compat 标准模式 BackCompat 混杂模式
  // const isCSS1Compat = doc.compatMode === 'CSS1Compat';
  const scrollX = () => {
    return !isPageScroll ? target.scrollLeft : is.Defined( win.pageXOffset ) ? win.pageXOffset
      : Math.max( html.scrollLeft, body.scrollLeft );
  };
  const scrollY = () => {
    return !isPageScroll ? target.scrollTop : is.Defined( win.pageYOffset ) ? win.pageYOffset
      : Math.max( html.scrollTop, body.scrollTop );
  };
  if ( hasXY( axis )) {
    return {
      top: scrollX(),
      left: scrollY()
    };
  } else if ( hasX( axis )) {
    return {
      top: 0,
      left: scrollX()
    };
  }
  return {
    top: scrollY(),
    left: 0
  };
};


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


function OverScroll( options ) {

  const overscroll = {
    scrollTop: 0,
    scrollLeft: 0,
    scrollHeight: 0,
    scrollWidth: 0
  };
  const { win, html, mode, isPageScroll } = options;
  const { getPosition, getClientSize, getScrollSize, getFromRange } = domUtils( options );
  const getScroll = getScrollByAxis( options );
  const overflow = get( options.target, 'overflow' );
  if ( overflow !== 'hidden' ) {
    set( options.target, 'overflow', 'hidden' );
  }

  function isTop() {
    return overscroll.scrollTop <= 1;
  }

  function isBottom() {
    return overscroll.scrollTop === overscroll.scrollHeight;
  }

  function isLeft() {
    return overscroll.scrollLeft <= 1;
  }

  function isRight() {
    return overscroll.scrollLeft === overscroll.scrollWidth;
  }

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

  const registerScrollMove = ({ target }) => {
    let v = 0;
    const a = ( vAbs ) => 0.5; // acceleration = friction / mass
    let lastTime = 0;
    const getVelocity = getFromRange( 6, 50 );
    requestAnimFrame(( time ) => {
      const { scrollLeft, scrollTop } = overscroll;
      const { top, left } = getScroll( target );
      if ( lastTime === 0 ) {
        const { width: scrollWidth, height: scrollHeight } = getScrollSize();
        const { width: clientWidth, height: clientHeight } = getClientSize();
        overscroll.scrollTop = top;
        overscroll.scrollLeft = left;
        overscroll.scrollWidth = scrollWidth;
        overscroll.scrollHeight = scrollHeight;
        overscroll.clientWidth = clientWidth;
        overscroll.clientHeight = clientHeight;
      } else if ( Math.abs( v ) > 0 ) {
        v = ( v > 0 ? 1 : -1 ) * Math.max( 0, Math.abs( v ) - a( Math.abs( v )));
        setScroll( scrollLeft, scrollTop - v );
      }
      lastTime = time;
    });
    return {
      scrollMove( velocity ) {
        if ( v > 0 !== velocity > 0 ) {
          v = 0;
        }
        v += ( velocity > 0 ? 1 : -1 ) * getVelocity( Math.abs( velocity ));
        v = ( velocity > 0 ? 1 : -1 ) * getVelocity( Math.abs( v ));
      },
      scrollStop() {
        v = 0;
      }
    };
  };

  const registerSectionMove = ({ target }) => {
    let v = 0;
    let d = 0;
    const esseOut = ( t ) => ( t === 1 ) ? 1 : -( 2 ** ( -10 * t )) + 1;
    const divisor = ( d, S ) => esseOut((( S - d ) / S )) / 4; // acceleration = friction / mass
    // let lastTime = 0;
    // const getVelocity = getFromRange( 6, 50 );
    requestAnimFrame((/* time */) => {
      const { scrollLeft, scrollTop, clientHeight } = overscroll;
      if ( v !== 0 && d !== 0 ) {
        if ( v > 0 !== d > 0 ) {
          v += ( d > 0 ? 1 : -1 ) * Math.max( 1, Math.abs( d ) * divisor( Math.abs( d ), clientHeight ));
        } else {
          v = ( d > 0 ? 1 : -1 ) * Math.max( 1, Math.abs( d ) * divisor( Math.abs( d ), clientHeight ));
        }
        d = ( d > 0 ? 1 : -1 ) * Math.max( Math.abs( d ) - Math.abs( v ), 0 );console.log(d, v)
        setScroll( scrollLeft, scrollTop + v );
      }
      if ( d === 0 ) {
        v = 0;
      }
      // lastTime = time;
    });
    return {
      scrollMove( velocity, distance ) {
        v = velocity;
        d = distance;
      },
      scrollStop() {
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
    const mouseDownEvent = addEventListener( html, 'mousedown', () => {
      scrollStop();
    });
    return addEventListener( isPageScroll ? html : target, eventName, ( event ) => {
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
    });
  }

  function addHammerScroll({ target }) {
    let scrollLeft;
    let scrollTop;
    const mc = new Hammer.Manager( target );
    mc.add( new Hammer.Pan({ direction: Hammer.DIRECTION_ALL, threshold: 0 }));
    mc.on( 'panstart panmove panend', ( event ) => {
      const { type, deltaY, pointers } = event;
      if ( type === 'panstart' && pointers.length === 1 ) {
        const { top, left } = getScroll( target );
        const { width: scrollWidth, height: scrollHeight } = getScrollSize();
        const { width: clientWidth, height: clientHeight } = getClientSize();
        overscroll.scrollTop = top;
        overscroll.scrollLeft = left;
        overscroll.scrollWidth = scrollWidth;
        overscroll.scrollHeight = scrollHeight;
        overscroll.clientWidth = clientWidth;
        overscroll.clientHeight = clientHeight;
        scrollLeft = overscroll.scrollLeft;
        scrollTop = overscroll.scrollTop;
      } else if ( type === 'panend' ) {
        const { velocityY } = event;
        if ( Math.abs( velocityY ) > 0.2 && pointers.length === 0 ) {
          scrollMove( velocityY * 20 );
        }
        event.preventDefault();
      } else if ( deltaY !== 0 ) {
        if ( pointers.length === 1 ) {
          setScroll( scrollLeft, scrollTop - deltaY );
        }
        event.preventDefault();
      }
    });
    const touchStartEvent = addEventListener( html, 'touchstart', () => {
      scrollStop();
    });
    return touchStartEvent;
  }

  if ( mode === 'scroll' ) {
    const { scrollMove, scrollStop } = registerScrollMove( options );
    addHammerScroll( options );
    const wheelEvent = addMouseWheelEvent( options );
  }

  function addHammerSection({ target, switchScale }) {
    let poss;
    let scrollLeft;
    let scrollTop;
    const [ upScale, downScale ] = switchScale;
    const mc = new Hammer.Manager( target );
    mc.add( new Hammer.Pan({ direction: Hammer.DIRECTION_ALL, threshold: 0 }));
    mc.on( 'panstart panmove panend', ( event ) => {
      const { type, deltaY, pointers } = event;
      if ( type === 'panstart' ) {
        const { top, left } = getScroll( target );
        const { width: scrollWidth, height: scrollHeight } = getScrollSize();
        const { width: clientWidth, height: clientHeight } = getClientSize();
        overscroll.scrollTop = top;
        overscroll.scrollLeft = left;
        overscroll.scrollWidth = scrollWidth;
        overscroll.scrollHeight = scrollHeight;
        overscroll.clientWidth = clientWidth;
        overscroll.clientHeight = clientHeight;
        scrollLeft = overscroll.scrollLeft;
        scrollTop = overscroll.scrollTop;
      } else if ( type === 'panend' ) {
        const { top, left } = getScroll( target );
        const { width: scrollWidth, height: scrollHeight } = getScrollSize();
        const { width: clientWidth, height: clientHeight } = getClientSize();
        overscroll.scrollTop = top;
        overscroll.scrollLeft = left;
        overscroll.scrollWidth = scrollWidth;
        overscroll.scrollHeight = scrollHeight;
        overscroll.clientWidth = clientWidth;
        overscroll.clientHeight = clientHeight;
        scrollLeft = overscroll.scrollLeft;
        scrollTop = overscroll.scrollTop;
        const { deltaY, velocityY } = event;
        const nearest = poss.reduce(( line, top ) => {
          return top > scrollTop && top < clientHeight + scrollTop ? top : line;
        }, 0 );
        if ( nearest !== 0 ) {
          console.log( deltaY, velocityY );
          // if ( deltaY > 0 && nearest - scrollTop > downScale * clientHeight ) {
          //   console.log(1, scrollTop + clientHeight - nearest)
          //   scrollMove( velocityY * 20, scrollTop + clientHeight - nearest );
          // }
          // if ( deltaY < 0 && nearest - scrollTop < ( 1 - upScale ) * clientHeight ) {
          //   console.log(3, nearest - scrollTop)
          //   scrollMove( velocityY * 20, nearest - scrollTop );
          // }
          // 初速度足够触发上下滑动
          if ( velocityY > 0 && velocityY > 0.5 ) { // 下滑
            scrollMove( -velocityY * 20, nearest - ( scrollTop + clientHeight ));
          } else if ( velocityY < 0 && velocityY < -0.5 ) { // 上滑
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
          else if ( velocityY > 0 ) {
            scrollMove( -velocityY * 20, nearest - ( scrollTop + clientHeight ));
          } else if ( velocityY < 0 ) {
            scrollMove( -velocityY * 20, nearest - scrollTop );
          } else if ( nearest - scrollTop > clientHeight / 2 ) {
            scrollMove( -0.1 * 20, nearest - ( scrollTop + clientHeight ));
          } else {
            scrollMove( 0.1 * 20, nearest - scrollTop );
          }
        }
        event.preventDefault();
      } else if ( deltaY !== 0 ) {
        if ( pointers.length === 1 ) {
          setScroll( scrollLeft, scrollTop - deltaY );
        }
        event.preventDefault();
      }
    });
    const touchStartEvent = addEventListener( html, 'touchstart', () => {
      scrollStop();
    });
    return {
      touchStartEvent,
      setPoss( positions ) {
        poss = [].concat( positions );
      }
    };
  }

  function setSections({ target, anchors }) {
    set( target, 'height', '100%' );
    anchors.forEach(( element ) => {
      set( element, 'height', '100%' );
    });
    return anchors.map( getPosition ).map(({ top }) => top );
  }

  if ( mode === 'section' ) {
    const poss = setSections( options );
    const { setPoss } = addHammerSection( options );
    setPoss( poss );
  }

  return {

  };
}

export default compose( OverScroll, getOptions );
