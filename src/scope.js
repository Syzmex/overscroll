
import is from 'whatitis';
import actions from './actions';
import domUtils from './utils/dom';
import domStates from './domStates';
import animations from './animations';
import getWindow from './utils/dom/getWindow';
import getDocument from './utils/dom/getDocument';
import { handleDestroy, handleScroll, handleBeforeScroll, handleAfterScroll,
  handleInit } from './handlers';


const X = 'x';
const Y = 'y';
const XY = 'xy';
const xreg = /x/i;
const yreg = /y/i;
const OVERSCROLL = 'OverScroll';
const OVERSCROLLX = 'OverScrollX';
const OVERSCROLLY = 'OverScrollY';

function hasX( axis ) {
  return xreg.test( axis );
}

function hasY( axis ) {
  return yreg.test( axis );
}

function hasXY( axis ) {
  return hasX( axis ) && hasY( axis );
}

function getAxis( axis = XY ) {
  if ( hasXY( axis )) {
    return XY;
  } else if ( hasX( axis )) {
    return X;
  }
  return Y;
}


const getScrollByAxis = ({ target, axis, win, html, body, isPageScroll }) => () => {
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
      top: scrollY(),
      left: scrollX()
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
  prefix: OVERSCROLL,
  thumbMiniSize: 20,
  // show: true,
  // showX: true,
  // showY: true,
  target: null,
  watchInterval: 100,
  watch: null,
  onInit: null,
  onScroll: null,
  onBeforeScroll: null,
  onAfterScroll: null,
  onDestroy: null,
  getContainer: null,
  isPageScroll: false,
  mode: 'scroll', // 'section'
  anchors: null,
  switchScale: [ 0.2, 0.2 ], // [往上拉的距离比例，往下拉的距离比例]
  position: [ 0, 0 ]
};

function getOptions({
  axis,
  prefix,
  // show,
  // showX,
  // showY,
  target,
  watchInterval,
  watch,
  onInit,
  onScroll,
  onBeforeScroll,
  onAfterScroll,
  onDestroy,
  // getContainer,
  mode,
  anchors,
  switchScale,
  position
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
  } else {
    options.target = target;
  }

  // 元素装载容器
  // if ( target === html ) {
  //   // options.container = options.target === html ? body : options.target;
  //   options.target = body;
  // } else {
  //   options.target = target;
  // }

  // container => containerX containerY
  // if ( is.Function( getContainer )) {
  //   const container = getContainer();
  //   if ( is.Element( container )) {
  //     options.containerX = container;
  //     options.containerY = container;
  //   } else {
  //     const { x, y, X, Y } = container;
  //     options.containerX = x || X;
  //     options.containerY = y || Y || options.containerX;
  //   }
  // } else {
  //   options.containerX = options.container;
  //   options.containerY = options.containerX;
  // }

  // 滚动条 计算
  // axis => scrollX scrollY
  options.axis = getAxis( axis );
  options.scrollX = hasX( options.axis );
  options.scrollY = hasY( options.axis );

  // 滚动条 显示/隐藏
  // show => showX showY
  // options.show = show !== false;
  // options.showX = options.show && showX !== false;
  // options.showY = options.show && showY !== false;

  // 样式前缀 prefix
  if ( is.String( prefix )) {
    options.prefix = prefix;
  }

  // 事件

  if ( is.Function( onInit )) {
    options.onInit = onInit;
  }

  // onScroll( scrollTop, scrollLeft )
  if ( is.Function( onScroll )) {
    options.onScroll = onScroll;
  }

  if ( is.Function( onBeforeScroll )) {
    options.onBeforeScroll = onBeforeScroll;
  }

  if ( is.Function( onAfterScroll )) {
    options.onAfterScroll = onAfterScroll;
  }

  if ( is.Function( onDestroy )) {
    options.onDestroy = onDestroy;
  }

  if ( is.Function( watch )) {
    options.watch = watch;
    if ( is.Number( watchInterval ) && watchInterval > 50 ) {
      options.watchInterval = watchInterval;
    }
  }

  if ( is.Array( position ) && position.every( is.Number )) {
    options.position = position;
  }

  if ( mode === 'section' ) {

    options.mode = mode;
    options.axis = hasY( options.axis ) ? Y : X;
    options.scrollX = options.axis === X;
    options.scrollY = options.axis === Y;
    options.position = is.Number( position ) ? position : 1;

    if ( is.Array( anchors ) && anchors.every( is.Element )) {
      options.anchors = anchors;
    } else {
      options.anchors = Array.prototype.slice.call( target.children );
    }

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

export default ( options ) => {

  const overscroll = {
    scrollTop: 0,
    scrollLeft: 0,
    scrollHeight: 0,
    scrollWidth: 0,
    clientHeight: 0,
    clientWidth: 0,
    section: 0,
    scrolling: false
  };

  const scope = {
    X,
    Y,
    XY,
    xreg,
    yreg,
    hasX,
    hasY,
    hasXY,
    OVERSCROLL,
    OVERSCROLLX,
    OVERSCROLLY,
    overscroll
  };

  Object.assign( scope, getOptions( options ));
  Object.assign( scope, domUtils( scope ), {
    getScroll: getScrollByAxis( scope ),
    handleDestroy: handleDestroy( scope ),
    handleBeforeScroll: handleBeforeScroll( scope ),
    handleAfterScroll: handleAfterScroll( scope ),
    handleScroll: handleScroll( scope ),
    handleInit: handleInit( scope )
  });
  Object.assign( scope, domStates( scope ));
  Object.assign( scope, actions( scope ));
  Object.assign( scope, animations( scope ));
  return scope;
};
