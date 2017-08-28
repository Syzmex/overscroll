// define( function ( require, exports, module ) {

  'use strict';

  // =============================== 事件简单实现 ===============================

  var isIE = /\bmsie [678]\.0\b/i.test( navigator.userAgent );

  Array.prototype.indexOf || ( Array.prototype.indexOf = function ( elt /*, from*/ ) {
    var
    len = this.length >>> 0,
    from = Number( arguments[ 1 ] ) || 0;
    from = ( from < 0 )
       ? Math.ceil( from )
       : Math.floor( from );
    if ( from < 0 ) {
      from += len;
    }
    for ( ; from < len; from++ ) {
      if ( from in this && this[ from ] === elt ) {
        return from;
      }
    }
    return -1;
  } );

  Array.prototype.forEach || ( Array.prototype.forEach = function ( fn, context ) {
    var i, len = this.length >>> 0;
    for ( i = 0 ; i < len; i ++ ) {
      if ( i in this ) {
        fn.call( context, this[ i ], i, this );
      }
    }
  } );

  Date.now || ( Date.now = function () {
    return + new Date;
  } );

  // 检测a元素包含b元素
  function contains ( a, b ) {
    // 标准浏览器支持compareDocumentPosition
    if( a.compareDocumentPosition ){
      return !!( a.compareDocumentPosition(b) & 16 );
    }
    // IE支持contains
    else if ( a.contains ) {
      return a !== b && a.contains( b );
    }

    return false;
  }

  function isNumber ( number ) {
    return Object.prototype.toString.call( number ) === '[object Number]';
  }

  function isEmpty ( obj ) {
    for ( var i in obj ) { return false; }
    return true;
  }

  function isFunction ( obj ) {
    return Object.prototype.toString.call( obj ) === '[object Function]';
  }

  // 保留d位小数,小数点移动n位
  function toFixed ( number, d, n ) {
    return Math.round( number * Math.pow( 10, d || 0 ) ) / Math.pow( 10, ( d || 0 ) - ( n || 0 ) );
  }

  function mix ( target, source, override, whitelist ) {

    if ( !target || !source ) { return; }
    if ( override !== false ) { override = true; }

    var prop, len, i,
      _mix = function ( prop ) {
        if ( override === true || !( prop in target ) ) {
          target[ prop ] = source[ prop ];
        }
      };

    if ( whitelist && ( len = whitelist.length ) ) {
      for ( i = len; i; ) {
        prop = whitelist[ --i ];
        if ( prop in source ) {
          _mix( prop );
        }
      }
    } else {
      for ( prop in source ) {
        _mix( prop );
      }
    }

    return target;
  }

  var msPointer = navigator.msPointerEnabled && navigator.msMaxTouchPoints &&
      !window.PointerEvent;
  var pointer = ( window.PointerEvent && navigator.pointerEnabled &&
      navigator.maxTouchPoints ) || msPointer;
  var TOUCH = !!( pointer || 'ontouchstart' in window || ( window.DocumentTouch &&
      document instanceof window.DocumentTouch ) );

  // Event再封装
  var Event = function ( e ) {

    if ( !( this instanceof Event ) ) {
      return new Event( e );
    }

    if ( e && e.type ) {
      this.originalEvent = e;
      this.type = e.type;

      this._isDefaultPrevented = (
        e.defaultPrevented ||
        e.returnValue === false ||
        e.getPreventDefault && e.getPreventDefault()
      ) ? true : false;

      // 标准化事件对象的属性
      Event.fix( this, e );

    } else {
      this.type = e;
    }

    this.timeStamp = e && e.timeStamp || Date.now();

  };

  Event.fix = function ( event, e ) {

    // 常用属性
    var
    eventProps = 'attrChange attrName relatedNode srcElement altKey bubbles cancelable \
          ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target \
          timeStamp view which fireData'.split( ' ' ),

    mouseProps = 'button buttons clientX clientY fromElement offsetX offsetY pageX pageY \
          screenX screenY toElement'.split( ' ' ),

    keybordProps = 'char charCode key keyCode'.split( ' ' ),

    rMouseEvent = /^(?:mouse|contextmenu)|click/,
    rKeybordEvent = /^(?:key(?:down|press|up))$/,
    rMousewheel = /^(?:DOMMouseScroll|mousewheel)$/;

    event = mix( event, e, true, eventProps );

    event.target = e.target || e.srcElement || document;
    event.currentTarget = e.currentTarget || this;

    // safari中的target可能是文本节点
    if ( event.target.nodeType === 3 ) {
      event.target = event.target.parentNode;
    }

    // IE6-8没有metaKey属性
    if ( e.metaKey === undefined ) {
      event.metaKey = e.ctrlKey;
    }

    // 修正标准鼠标事件
    if ( rMouseEvent.test( e.type ) ) {
      var
      doc = event.target.ownerDocument || document,
      docElem = doc.documentElement,
      body = doc.body,
      button = e.button,
      fromElement = e.fromElement;

      // 合并鼠标事件的常用属性到新Event中
      event = mix( event, e, true, mouseProps );

      // IE6-8不支持event.pageX和event.pageY
      if ( event.pageX === undefined && e.clientX !== undefined ) {
        event.pageX = e.clientX +
              ( docElem.scrollLeft || body.scrollLeft || 0 ) -
              ( docElem.clientLeft || body.clientLeft || 0 );
        event.pageY = e.clientY +
              ( docElem.scrollTop || body.scrollTop || 0 ) -
              ( docElem.clientTop || body.clientTop || 0 );
      }

      // firefox不支持event.offsetX和event.offsetY
      if ( event.offsetX === undefined ) {
        event.offsetX = e.layerX;
        event.offsetY = e.layerY;
      }

      // relatedTarget 属性返回触发 mouseover 和 mouseout 的元素
      // IE6-8：mouseover 为 fromElement，mouseout 为 toElement
      if ( !event.relatedTarget && fromElement ) {
        event.relatedTarget = fromElement === target ? e.toElement : fromElement;
      }

      // 为 click 事件添加 which 属性，左1 中2 右3
      // IE button的含义：
      // 0：没有键被按下
      // 1：按下左键
      // 2：按下右键
      // 3：左键与右键同时被按下
      // 4：按下中键
      // 5：左键与中键同时被按下
      // 6：中键与右键同时被按下
      // 7：三个键同时被按下
      if ( !event.which && button !== undefined ) {
        event.which = [ 0, 1, 3, 0, 2, 0, 0, 0 ][ button ];
      }

      doc = docElem = body = null;
    }

    // 修正触摸事件
    if ( window.Touch && e.touches && e.touches[ 0 ] ) {
      event.pageX = e.touches[ 0 ].pageX;
      event.pageY = e.touches[ 0 ].pageY;
      event.clientX = e.touches[ 0 ].clientX;
      event.clientY = e.touches[ 0 ].clientY;
    }

    // 修正标准按键事件
    if ( rKeybordEvent.test( e.type ) ) {
      // 合并按键事件的常用属性到新Event中
      event = mix( event, e, true, keybordProps );

      if( event.which === undefined ) {
        event.which = e.charCode !== undefined ? e.charCode : e.keyCode;
      }
    }

    // 修正鼠标滚轮事件，统一使用wheelDelta属性
    if ( rMousewheel.test( e.type ) ) {
      // safari可能会出现小数点
      if ( 'wheelDelta' in e ) {
        event.wheelDelta = Math.round( e.wheelDelta );
      }
      else if ( 'detail' in e ) {
        event.wheelDelta = - e.detail * 40;
      }
    }

    return event;
  };

  Event.prototype = {

    preventDefault: function () {

      this._isDefaultPrevented = true;
      var e = this.originalEvent;

      if ( e ) {
        if ( e.preventDefault ) { e.preventDefault(); }

        // IE6-8
        else {
          e.returnValue = false;
        }
      }
    },


    stopPropagation: function () {

      this._isPropagationStopped = true;
      var e = this.originalEvent;

      if ( e ) {
        if ( e.stopPropagation ) { e.stopPropagation(); }

        // IE6-8
        else {
          e.cancelBubble = true;
        }
      }
    },

    // 阻止同类型事件冒泡的方法
    stopImmediatePropagation: function () {
      this._isImmediatePropagationStopped = true;
      this.stopPropagation();
    },

    // 判定是否阻止了默认事件
    _isDefaultPrevented: false,
    isDefaultPrevented: function () {
      return this._isDefaultPrevented;
    },

    // 判定是否阻止了冒泡
    _isPropagationStopped: false,
    isPropagationStopped: function () {
      return this._isPropagationStopped;
    },

    // 判定是否阻止了同类型事件的冒泡
    _isImmediatePropagationStopped: false,
    isImmediatePropagationStopped: function () {
      return this._isImmediatePropagationStopped;
    }

  };

  // 事件
  var events =  {
    _obj_: [],
    _handles_: []
  };

  // 事件执行函数
  function eventHandle ( e ) {
    var i, evt, handles, funcs;
    e = Event( e || window.event );
    evt = e.type.replace( /^on/i, '' );
    handles = events._handles_[ events._obj_.indexOf( this ) ];
    funcs = handles[ evt ];
    for ( i = 0; i < funcs.length; i ++ ) {
      if ( funcs[ i ].call( this, e ) === false ) {
        e.preventDefault();
        e.stopPropagation();
      }
      if ( e.isImmediatePropagationStopped() ) { break; }
    }
  }

  // IE8
  function fixAttachHandle ( dom, evt ) {

    if ( !events.attachEventHandle )  {
      events.attachEventHandle = {};
    }

    if ( !events.attachEventHandle[ evt ] ) {
      events.attachEventHandle[ evt ] = [];
    }

    return events.attachEventHandle[ evt ][ events._obj_.indexOf( dom ) ] = function ( e ) {
      eventHandle.call( dom, e );
    };
  }

  // IE8
  function findAttachHandle ( dom, evt ) {

    if ( !events.attachEventHandle || !events.attachEventHandle[ evt ] )  {
      return false;
    }

    return events.attachEventHandle[ events._obj_.indexOf( dom ) ] || false;
  }

  // 添加事件
  function on ( dom, evt, fn, useCapture ) {

    var
    handles,
    index = events._obj_.indexOf( dom );
    if ( !isFunction( fn ) ) { return; }

    if ( !~index ) {
      events._obj_.push( dom );
      index = events._obj_.indexOf( dom );
    }

    handles = events._handles_[ index ];
    if ( !handles ) {
      handles = events._handles_[ index ] = {};
    }

    if ( !handles[ evt ] ) {
      handles[ evt ] = [];
      if ( dom.addEventListener ) {
        dom.addEventListener( evt, eventHandle, !!useCapture );
      }
      else if ( dom.attachEvent ) {
        dom.attachEvent( 'on' + evt, fixAttachHandle( dom, evt ) );
      }
      else {
        dom[ 'on' + evt ] = eventHandle;
      }
    }

    if ( !~handles[ evt ].indexOf( fn ) ) {
      handles[ evt ].push( fn );
    }

  }

  // 删除事件
  function off ( dom, evt, fn ) {

    var
    handles, funcs, attachEventHandle,
    index = events._obj_.indexOf( dom );

    if ( !~index ) { return; }

    handles = events._handles_[ index ];
    funcs = handles[ evt ];

    if ( !funcs ) { return; }

    if ( fn === undefined ) {
      funcs.splice( 0, funcs.length );
    }
    else if ( ~funcs.indexOf( fn ) ) {
      funcs.splice( funcs.indexOf( fn ), 1 );
    }

    if ( funcs.length === 0 ) {
      delete handles[ evt ];
      if ( isEmpty( handles ) ) {
        events._handles_[ index ] = null;
        events._obj_[ index ] = null;
      }
      if ( dom.removeEventListener ) {
        dom.removeEventListener( evt, eventHandle );
      }
      else if ( dom.detachEvent ) {
        attachEventHandle = findAttachHandle( dom, evt );
        if ( attachEventHandle ) {
          dom.detachEvent( 'on' + evt, attachEventHandle );
        }
      }
      else {
        dom[ 'on' + evt ] = null;
      }
    }
  }

  // =============================== 辅助函数 ===============================

  var
  rBorderWidth = /^border(\w)+Width$/,
  isECMAStyle = !!( document.defaultView && document.defaultView.getComputedStyle ),
  cssShow = {
    visibility : 'hidden',
    display : 'block'
  },
  sizeParams = {
    'Width' : [ 'Left', 'Right' ],
    'Height' : [ 'Top', 'Bottom' ]
  },

  capitalize = function ( str ) {
    var firstStr = str.charAt( 0 );
    return firstStr.toUpperCase() + str.replace( firstStr, '' );
  },

  isWindow = function( obj ) {
    return obj && typeof obj === 'object' && 'setInterval' in obj;
  },

  getStyle,

  Css = {

    /*
     * 获取元素的尺寸
     * outer包含padding和border
     * inner包含padding
     * normal = outer - border - padding
     * @param { HTMLElement } DOM元素
     * @param { String } Width/Height
     * @param { String } Outer/inner
     * @return { Number/String }
     */
    getSize: function ( elem, type, extra ) {

      var
      val = elem[ 'offset' + type ];
      type = sizeParams[ type ];

      if ( extra === 'outer' ) {
        return val;
      }

      // inner = outer - border
      val -= parseFloat( getStyle(elem, 'border' + type[ 0 ] + 'Width') ) +
        parseFloat( getStyle(elem, 'border' + type[ 1 ] + 'Width') );

      if ( extra === 'inner' ) {
        return val;
      }

      // normal = inner - padding
      val -= parseFloat( getStyle( elem, 'padding' + type[ 0 ] ) ) +
        parseFloat( getStyle( elem, 'padding' + type[ 1 ] ) );

      return val + 'px';
    },

    // 将元素从隐藏状态切换到显示状态，执行回调后再隐藏元素
    swap: function ( elem, fn ) {

      var
      obj = {},
      name, val;

      if ( elem.offsetWidth ) {
        val = fn();
      }
      else {

        // 元素如果隐藏状态需要先切换到显示状态才能取其尺寸
        for ( name in cssShow ) {
          obj[ name ] = elem.style[ name ];
          elem.style[ name ] = cssShow[ name ];
        }

        val = fn();

        // 取得尺寸后仍将元素隐藏
        for ( name in obj ) {
          elem.style[ name ] = obj[ name ];
        }
      }

      return val;
    }
  }

  if ( isECMAStyle ) {
    getStyle = function ( elem, name ) {
      var
      doc = elem.ownerDocument,
      defaultView = doc.defaultView,
      val;

      if ( defaultView ) {
        val = defaultView.getComputedStyle( elem, null )[ name ];
      }

      // 取不到计算样式就取其内联样式
      if ( val === '' ) {
        val = elem.style[ name ];
      }
      return val;
    };
  }
  else {
    getStyle = function ( elem, name ) {
      var
      val = elem.currentStyle && elem.currentStyle[ name ],
      style = elem.style,
      left, rsLeft;

      // 取不到计算样式就取其内联样式
      if ( val === null ) {
        val = style[ name ];
      }

      // 将IE中的字体大小的各种单位统一转换成px：12pt => 16px
      /*if ( !rNumpx.test( val ) && rNum.test( val ) ) {
        left = style.left;
        rsLeft = elem.runtimeStyle && elem.runtimeStyle.left;

        if ( rsLeft ) {
          elem.runtimeStyle.left = elem.currentStyle.left;
        }

        style.left = name === 'fontSize' ? '1em' : ( val || 0 );
        val = style.pixelLeft + 'px';

        style.left = left;
        if ( rsLeft ) {
          elem.runtimeStyle.left = rsLeft;
        }
      }*/

      // IE6-8中borderWidth如果为0px返回的是medium，需进行修复
      if ( val === 'medium' && rBorderWidth.test( name ) ) {
        return '0px';
      }

      return val;
    };
  }

  // width、height、outerWidth、outerHeight、innerWidth、innerHeight的原型方法拼装
  [ 'width', 'height' ].forEach( function ( name ) {
    var upName = capitalize( name ),

    get = function ( elem ) {
      var docElem;

      if ( !elem ) {
        return;
      }

      if ( isWindow( elem ) ) {
        return elem.document.documentElement[ 'client' + upName ];
      }

      if ( elem.nodeType === 9 ) {
        docElem = elem.documentElement;
        return Math.max( docElem[ 'scroll' + upName ], docElem[ 'client' + upName ] ) ;
      }

      return Css.swap( elem, function () {
        var val = getStyle( elem, name );

        // IE6-8没有显式的指定宽高会返回auto，此时需要计算
        return val === 'auto' ? Css.getSize( elem, upName ) : val;
      } );
    };

    Css[ name ] = function ( elem ) {
      return parseFloat( get( elem ) );
    };

    [ 'outer', 'inner' ].forEach( function ( name ) {
      Css[ name + upName ] = function ( elem ) {
        var docElem;

        if ( !elem ) {
          return;
        }

        if ( isWindow( elem ) ) {
          return elem.document.documentElement[ 'client' + upName ];
        }

        if ( elem.nodeType === 9 ) {
          docElem = elem.documentElement;
          return Math.max( docElem[ 'scroll' + upName ], docElem[ 'client' + upName ] ) ;
        }

        return Css.swap( elem, function () {
          return Css.getSize( elem, upName, name );
        } );
      };
    } );

  } );

  // 获取 css 属性
  /*function getStyle ( dom, prop ) {

    // IE
    if ( dom.currentStyle ) {
      return dom.currentStyle[ prop.toLowerCase() ];
    }

    // W3C浏览器
    if ( dom.ownerDocument.defaultView.opener ) {
      return dom.ownerDocument.defaultView.getComputedStyle( dom, null )[ prop.toLowerCase() ];
    }

    return window.getComputedStyle( dom, null )[ prop.toLowerCase() ];
  }*/

  // 从相对路径获取绝对路径
  // function getFilePath ( file ) {
  //     if ( isFunction( define ) && file ) {
  //         var
  //         path,
  //         isResolve = !/^\//.test( file ),
  //         fn = require[ require.toUrl ? 'toUrl' : 'resolve' ];
  //         if ( fn ) {
  //             path = ( isResolve ? fn( './' ) : '' ) + file;
  //         }
  //         return path;
  //     }
  //     else if ( file ) {
  //         return window.AsrollbarPath + file;
  //     }
  //     else { return ''; }
  // }


  // =============================== 拖拽最小化封装 ===========================

  var Drag = function ( opt ) {

    if ( !( this instanceof Drag ) ) {
      return new Drag( opt );
    }

    opt  = opt || {};
    this.axis = opt.axis || 'y';
    this.target = opt.target || null;
    this.moveTarget = opt.moveTarget != false;
    this.container = opt.container || window;
    this.maxTop = opt.maxTop === void 0 ? 10000000 : opt.maxTop;
    this.maxLeft = opt.maxLeft === void 0 ? 10000000 : opt.maxLeft;
    this.minTop = opt.minTop === void 0 ? -10000000 : opt.minTop;
    this.minLeft = opt.minLeft === void 0 ? -10000000 : opt.minLeft;
    this.onDragStart = opt.onDragStart;
    this.onDragEnd = opt.onDragEnd;
    this.onDrag = opt.onDrag;
    this.doc = this.target.ownerDocument;
    this.win = this.doc.defaultView || this.doc.parentWindow;
    this.isMoving = false;
    this.movecount = 0; // move事件的节流计数
    this.handle = isIE ? this.target : this.doc;

    // 清除文本选择
    this.clearSelect = 'getSelection' in this.win ? function () {
      this.win.getSelection().removeAllRanges();
    } : function () {
      try {
        this.doc.selection.empty();
      }
      catch ( e ) {};
    };

    var that = this;

    this.downHandle = function ( e ) {
      that.down.call( that, e );
    };
    this.moveHandle = function ( e ) {
      that.move.call( that, e );
    };
    this.upHandle = function ( e ) {
      that.up.call( that, e );
    };

    this.events = {
      START: TOUCH ? [ 'touchstart', 'mousedown' ] : [ 'mousedown' ],
      END: {
        mousedown: 'mouseup',
        touchstart: 'touchend',
        pointerdown: 'touchend',
        MSPointerDown: 'touchend'
      },
      MOVE: {
        mousedown: 'mousemove',
        touchstart: 'touchmove',
        pointerdown: 'touchmove',
        MSPointerDown: 'touchmove'
      }
    };

    this.events.START.forEach( function ( start ) {
      on( this.target, start, this.downHandle );
    }, this );

    // on( this.target, 'mousedown', this.downHandle );

  };

  Drag.prototype = {

    down: function ( e ) {

      this.isDown = true;
      var
      axis = this.axis,
      target = this.target,
      offset = this.offset( target ),
      posType = getStyle( this.target, 'position' );

      this.boundary = this.refreshBoundary();

      if ( posType === 'static' ) {
        target.style.position = 'absolute';
      }

      this.originalX = e.clientX - offset.left;
      this.originalY = e.clientY - offset.top;

      // 横向拖拽
      if ( axis === 'x' ) {
        this.originalY = false;
      }

      // 纵向拖拽
      else if ( axis === 'y' ) {
        this.originalX = false;
      }

      on( this.handle, this.events.MOVE[ e.type ], this.moveHandle );
      on( this.handle, this.events.END[ e.type ], this.upHandle );
      // on( this.handle, 'mousemove', this.moveHandle );
      // on( this.handle, 'mouseup', this.upHandle );

      if ( isIE ) {
        this.handle.setCapture();
        on( this.handle, 'losecapture', this.upHandle );
      }

      if ( isFunction( this.onDragStart ) ) {
        this.onDragStart.call( this, e );
      }

      TOUCH || e.stopPropagation();
      TOUCH || e.preventDefault();

    },

    move: function ( e ) {

      if ( !this.isDown ) { return; }

      // this.movecount ++;
      // if ( this.movecount % 2 === 0 ) {
      //   return;
      // }

      this.clearSelect();
      this.isMove = true;

      var
      target = this.target,
      style = target.style,
      currentX = e.clientX,
      currentY = e.clientY,
      originalX = this.originalX,
      originalY = this.originalY,
      boundary = this.boundary,
      x, y, left, right, top, bottom;

      if ( originalX || originalX === 0 ) {
        x = currentX - originalX;
        if ( boundary ) {
          left = boundary.left;
          right = boundary.right;
          this.moveTarget && ( x = toFixed( x / boundary.cwidth, 7, 2 ) );
          x = x < left ? left : x > right ? right : x;
        }
        this.moveTarget && currentX != originalX && ( style.left = x + '%' );
      }

      // 纵向
      if ( originalY || originalY === 0 ) {
        y = currentY - originalY;
        if ( boundary ) {
          top = boundary.top;
          bottom = boundary.bottom;
          this.moveTarget &&  ( y = toFixed( y / boundary.cheight, 7, 2 ) );
          y = y < top ? top : y > bottom ? bottom : y;
        }
        this.moveTarget && currentY != originalY && ( style.top = y + '%' );
      }

      if ( isFunction( this.onDrag ) ) {
        this.onDrag.call( this, y, x, e );
      }

      e.stopPropagation();
    },

    up: function ( e ) {

      this.isDown = false;

      // 卸载mousemove和mouseup事件
      // off( this.handle, 'mouseup' );
      // off( this.handle, 'mousemove' );
      for ( var i in this.events.MOVE ) {
        off( this.handle, this.events.MOVE[ i ] )
        off( this.handle, this.events.END[ i ] );
      }

      if ( isIE ) {
        off( this.handle, 'losecapture' );
        this.handle.releaseCapture();
      }

      this.isMove = false;

      if ( isFunction( this.onDragEnd ) ) {
        this.onDragEnd.call( this, e );
      }

      e && e.stopPropagation();
    },

    offset: function ( dom ) {
      return {
        top : dom.offsetTop,
        left : dom.offsetLeft
      };
    },

    refreshBoundary: function() {

      // 滑块的top/left值是百分比,track的边宽不计算在内
      var
      cheight = Css.innerHeight( this.container ),
      cwidth = Css.innerWidth( this.container );

      // 均为百分比
      return {
        top: isFunction( this.minTop ) ? this.minTop() : this.minTop,
        right: isFunction( this.maxLeft ) ? this.maxLeft() : this.maxLeft,
        left: isFunction( this.minLeft ) ? this.minLeft() : this.minLeft,
        bottom: isFunction( this.maxTop ) ? this.maxTop() : this.maxTop,
        cheight: parseFloat( cheight ),
        cwidth: parseFloat( cwidth )
      };
    },

    destroy: function () {
      if ( this.isDown ) {
        this.up.call( this );
      }
      off( this.target, 'mousedown', this.downHandle );
    }
  };

  // =============================== 滚动条对象 ===============================


  var PrototypeScrollBar = function ( opt ) {

    if ( !( this instanceof PrototypeScrollBar ) ) {
      return new PrototypeScrollBar( opt );
    }

    opt  = opt || {};

    this.config = opt;

    this.version = '1.0.0';

    this.doc = this.dom && this.dom.ownerDocument || window.document;
    this.win = this.doc.defaultView || this.doc.parentWindow;
    this.docElem = this.doc.documentElement;
    this.body = this.doc.body;

    // 判断火狐
    this.isFirefox = /firefox/i.test( navigator.userAgent );

    // 判断body是否可以滚动
    // 在默认情况下不指定滚动主体的时候，滚动主体是整个页面
    // 在某些浏览器中页面滚动的主体是body标签有些则是html标签
    var body = this.body;
    this.isBody = function () {
      var scrollTop, scrollLeft;

      if ( body.scrollTop === 0 ) {
        scrollTop = ++ body.scrollTop;
        body.scrollTop --;
      }
      if ( body.scrollLeft === 0 ) {
        scrollLeft = ++ body.scrollLeft;
        body.scrollLeft --;
      }

      return scrollTop > 0 || scrollLeft > 0;
    };

    // 滚动条的容器
    this.dom = opt.dom || ( this.isBody() ? this.body : this.docElem );

    // 存放滚动条DOM的容器
    this.container = this.dom === this.docElem ? this.body : ( opt.container || this.dom );

    // 判断是页面滚动条还是内部滚动条
    this.isPage = /^body|html$/i.test( this.dom.tagName );

    // 惯性系数
    this.inertialCoefficient = opt.inertialCoefficient || 0.5;

    // 滚动条样式
    // this.css = opt.css || 'css/Ascrollbar.css';
    this.zIndex = opt.zIndex || 888;

    this.amin = opt.amin !== false;

    // 滚动条最小长度
    this.minLenght = opt.minLenght || 30;

    // 滚动速度
    this.speed = opt.speed || 20;

    // 两端的方向按钮
    this.buttons = opt.buttons === true;

    // 横竖滚动条
    this.axis = opt.axis || 'xy';

    // 纵向
    this.vertical = !!~this.axis.indexOf( 'y' );

    // 横向
    this.horizontal = !!~this.axis.indexOf( 'x' );

    // 监视时间间隔
    this.watchingInterval = 100;
    this.watchCallback = opt.watchCallback;

    // 页面滑动的区域
    this.pageDragAxis = opt.pageDragAxis;
    this.pageDragDom = opt.pageDragDom;
    this.pageDragStartCallBack = opt.pageDragStartCallBack;
    this.pageDragEndCallBack = opt.pageDragEndCallBack;
    this.pageDragCallBack = opt.pageDragCallBack;

    // 动画时间间隔
    this.aminInterval = toFixed( 1000 / 50, 1 );

    // 缓动公式
    this.easing = function ( t ) {
      return Math.sqrt( Math.sqrt( t ) );
    };

    // 滚动块的模板,
    // 比如 图片 / 多层div结构
    this.thumbVertical = opt.thumbVertical || opt.thumb;
    this.thumbHorizontal = opt.thumbHorizontal || opt.thumb;
    this.upBtnVertical = opt.upBtnVertical || opt.upBtn;
    this.upBtnHorizontal = opt.upBtnHorizontal || opt.upBtn;
    this.downBtnVertical = opt.downBtnVertical || opt.downBtn;
    this.downBtnHorizontal = opt.downBtnHorizontal || opt.downBtn;

    // 滑块最小大小
    this.thumbMiniSize = opt.thumbMiniSize || opt.miniSize || 20;
    this.thumbHorizontalMiniSize = opt.thumbHorizontalMiniSize || opt.miniSize || 20;

    // 滚动事件
    this.onScroll = opt.onScroll;
    this.onScrollChange = opt.onScrollChange;

    this.scrollBody = this.isPage ? this.docElem : this.dom;
    this.curScrollTop = this.dom.scrollTop;
    this.curScrollLeft = this.dom.scrollLeft;

    // 滑块开始和结束指针
    this.scrollTopStartT = + new Date();
    this.scrollTopEndT = this.scrollTopStartT;
    this.scrollLeftStartT = + new Date();
    this.scrollLeftEndT = this.scrollLeftStart;

    // 最大值计算
    this.maxScrollTop = this.scrollBody.scrollHeight - this.scrollBody.clientHeight;
    this.maxScrollLeft = this.scrollBody.scrollWidth - this.scrollBody.clientWidth;

    // 滑块速度
    this.v = 0;

    // 初始化
    this._init();

  };



  // 初始化 dom 结构
  PrototypeScrollBar.prototype = {

    _init: function () {

      // 初始化HTML结构
      this._initHtml();

      // 添加事件
      this._addWheelEvent();

      // 添加拖拽事件
      this._addDrag();
    },

    _initHtml: function () {

      // 加载样式
      // if ( this.css && !document.getElementById( 'asbcss' ) ) {
      //     var
      //     link = document.createElement( 'link' ),
      //     head = document.getElementsByTagName( 'head' )[ 0 ];
      //     link.id = 'asbcss';
      //     link.rel = 'stylesheet';
      //     link.href = getFilePath( this.css );
      //     link.href && head.appendChild( link );
      // }

      // 添加相对定位样式
      if ( !this._isPosition() ) {
        this.style_dom_position = this.dom.style.position;
        this.dom.style.position = 'relative';
      }

      // 隐藏滚动条
      // 滚动主体为body、html标签时
      // 滚动条在html标签上 即：document.documentElement
      // 如果隐藏body的滚动条会使得页面不能滚动
      if ( this.isPage ) {
        this.style_docElem_overflow = this.docElem.style.overflow;
        this.docElem.style.overflow = 'hidden';
      } else {
        this.style_dom_overflow = this.dom.style.overflow;
        this.dom.style.overflow = 'hidden';
      }

      if ( this.vertical ) {
        this.createDom( true );
      }

      if ( this.horizontal ) {
        this.createDom( false );
      }

      // 初始化滑块大小
      this.resetSize();

      // 滚动条初始化位置
      this.resetPosition( this.curScrollTop );

      // 开始监视容器大小变化以便及时调整滑块大小位置
      this._watching();

    },

    createDom: function ( isVertical ) {

      var
      wrap = document.createElement( 'div' ),
      track = document.createElement( 'div' ),
      thumb = document.createElement( 'div' );

      wrap.className = 'asb-wrap ' + ( isVertical ? 'vertical' : 'horizontal' );
      wrap.style.cssText = 'position:absolute;z-index:' + this.zIndex + ';' +
        ( isVertical ? 'right:0;top:0;height:100%;' : 'bottom:0;left:0;width:100%;');

      // 平铺自适应高度
      track.className = 'asb-track';
      track.style.cssText = 'position:absolute;margin:auto;top:0;left:0;right:0;bottom:0;';

      // 设置滑块最小高度
      thumb.className = 'asb-thumb';
      thumb.style.cssText = 'border:0;padding:0;margin:0;position:absolute;' +
        ( isVertical ? 'min-height:' : 'min-width:' ) + this.thumbMiniSize + 'px';

      // 如果是窗口滚动条需要fixed
      if ( this.isPage ) {
        wrap.style.position = 'fixed';
      }

      // 调整滚动条位置一般都为0
      else if ( isVertical ) {
        wrap.style.top = this.curScrollTop + 'px';
      }
      else {
        wrap.style.left = this.curScrollLeft + 'px';
      }

      // 如果不需要显示滚动条就隐藏
      if ( !this._haveScroll( isVertical ) ) {
        wrap.style.display = 'none';
        if ( isVertical ) {
          this.yBarShow = false;
        } else {
          this.xBarShow = false;
        }
      } else {
        if ( isVertical ) {
          this.yBarShow = true;
        } else {
          this.xBarShow = true;
        }
      }

      // 缓存dom
      if ( isVertical ) {
        this.domVerticalWrap = wrap;
        this.domVerticalTrack = track;
        this.domVerticalThumb = thumb;
      }
      else {
        this.domHorizontalWrap = wrap;
        this.domHorizontalTrack = track;
        this.domHorizontalThumb = thumb;
      }

      track.appendChild( thumb );

      if ( this.buttons ) {

        var
        upBtn = document.createElement( 'div' ),
        downBtn = document.createElement( 'div' );

        wrap.className += ' asb-buttons';
        upBtn.className = 'asb-up';
        downBtn.className = 'asb-down';
        wrap.appendChild( upBtn );
        wrap.appendChild( track );
        wrap.appendChild( downBtn );

        // 缓存dom
        if ( isVertical ) {
          this.domVerticalUp = upBtn;
          this.domVerticalDown = downBtn;
          if ( this.upBtnVertical ) this.domVerticalUp.innerHTML = this.upBtnVertical;
          if ( this.downBtnVertical ) this.domVerticalDown.innerHTML = this.downBtnVertical;
          if ( this.thumbVertical ) thumb.innerHTML = this.thumbVertical;
        }
        else {
          this.domHorizontalUp = upBtn;
          this.domHorizontalDown = downBtn;
          if ( this.upBtnHorizontal ) this.domHorizontalUp.innerHTML = this.upBtnHorizontal;
          if ( this.downBtnHorizontal ) this.domHorizontalDown.innerHTML = this.downBtnHorizontal;
          if ( this.thumbHorizontal ) thumb.innerHTML = this.thumbHorizontal;
        }
      }
      else {
        wrap.appendChild( track );
      }

      if ( this.isPage ) {
        this.container.appendChild( wrap );
      }
      else {
        this.container.insertBefore( wrap, this.container.firstChild );
      }

    },

    _watching: function () {
      var
      that = this,
      elem = this.scrollBody,
      pvc, phc, reset;

      if ( elem.scrollHeight == 0 ||  elem.scrollHeight - elem.clientHeight <= 1 ) {
        this.thumbVerticalPercent = 1;
      } else {
        this.thumbVerticalPercent = elem.clientHeight / elem.scrollHeight;
      }

      if ( elem.scrollWidth == 0 ||  elem.scrollWidth - elem.clientWidth <= 1 ) {
        this.thumbHorizontalPercent = 1;
      } else {
        this.thumbHorizontalPercent = elem.clientWidth / elem.scrollWidth;
      }

      this.watcher = setInterval( function () {

        reset = false;

        if ( that.vertical ) {

          that.curScrollTop = that.dom.scrollTop;
          that.curClientHeight = that.scrollBody.clientHeight;
          that.curScrollHeight = that.scrollBody.scrollHeight;

          // 纵向
          if ( that.curScrollHeight == 0 || that.curScrollHeight - that.curClientHeight <= 1 ) {
            pvc = 1;
          } else {
            pvc = that.curClientHeight / that.curScrollHeight;
          }
          // pvc = elem.clientHeight / elem.scrollHeight;
          if ( pvc >= 1 && that.domVerticalWrap.style.display !== 'none' ) {
            that.domVerticalWrap.style.display = 'none';
            that.yBarShow = false;
          }
          else if ( pvc < 1 && that.domVerticalWrap.style.display === 'none' ) {
            that.domVerticalWrap.style.display = '';
            that.yBarShow = true;
          }
          if ( that.thumbVerticalPercent !== pvc ) {
            that.maxScrollTop = that.curScrollHeight - that.curClientHeight;
            that.thumbVerticalPercent = pvc;
            reset = true;
          }
        }

        if ( that.horizontal ) {

          that.curScrollLeft = that.dom.scrollLeft;
          that.curClientWidth = that.scrollBody.clientWidth;
          that.curScrollWidth = that.scrollBody.scrollWidth;

          // 横向
          if ( that.curScrollWidth == 0 || that.curScrollWidth - that.curClientWidth <= 1 ) {
            phc = 1;
          } else {
            phc = that.curClientWidth / that.curScrollWidth;
          }
          // phc = elem.clientWidth / elem.scrollWidth;
          if ( phc >= 1 && that.domHorizontalWrap.style.display !== 'none' ) {
            that.domHorizontalWrap.style.display = 'none';
            that.xBarShow = false;
          }
          else if ( phc < 1 && that.domHorizontalWrap.style.display === 'none' ) {
            that.domHorizontalWrap.style.display = '';
            that.xBarShow = true;
          }
          if ( that.thumbHorizontalPercent !== phc ) {
            that.maxScrollLeft = that.curScrollWidth - that.curClientWidth;
            that.thumbHorizontalPercent = phc;
            reset = true;
          }
        }

        if ( typeof that.watchCallback === 'function' ) {
          that.watchCallback();
        }

        if ( reset ) {
          that.reset();
        }

      }, this.watchingInterval );
    },

    // 计算滑块大小百分比
    getThumbPercent: function ( isVertical ) {
      if ( isVertical ) {
        return toFixed( this.scrollBody.clientHeight / this.scrollBody.scrollHeight, 7, 2 );
      }
      return toFixed( this.scrollBody.clientWidth / this.scrollBody.scrollWidth, 7, 2 );
    },

    // 计算滑块大小
    getThumbRealSize: function ( isVertical ) {
      if ( isVertical ) {
        return toFixed( this.getTrackSize( isVertical ) * this.scrollBody.clientHeight / this.scrollBody.scrollHeight, 7, 2 );
      }
      return toFixed( this.getTrackSize( isVertical ) * this.scrollBody.clientWidth / this.scrollBody.scrollWidth, 7 );
    },

    // 计算轨道大小
    getTrackSize: function ( isVertical ) {
      if ( !!isVertical !== false ) {
        return parseInt( Css.innerHeight( this.domVerticalTrack ) );
      }
      else {
        return parseInt( Css.innerWidth( this.domHorizontalTrack ) );
      }
    },

    // 重置滚动条状态
    reset: function () {
      this.resetSize();
      this.resetPosition();
    },

    // 设置滑块大小
    resetSize: function () {

      var thumbSize, percent, trackSize;

      if ( this.vertical && this.domVerticalWrap.style.display !== 'none' ) {

        // 单位px 默认滑块最小20px
        thumbSize = this.thumbMiniSize + 'px',
        percent = this.getThumbPercent( true ),
        trackSize = this.getTrackSize( true );

        // 设置滑块大小百分比
        if ( trackSize * percent / 100 >= this.thumbMiniSize ) {
          thumbSize = percent + '%';
        }
        this.domVerticalThumb.style.height = thumbSize;
      }

      if ( this.horizontal && this.domHorizontalWrap.style.display !== 'none' ) {

        // 单位px 默认滑块最小20px
        thumbSize = this.thumbMiniSize + 'px',
        percent = this.getThumbPercent( false ),
        trackSize = this.getTrackSize( false );

        // 设置滑块大小百分比
        if ( trackSize * percent / 100 >= this.thumbMiniSize ) {
          thumbSize = percent + '%';
        }
        this.domHorizontalThumb.style.width = thumbSize;
      }

    },

    resetPosition: function ( scrollTop, scrollLeft ) {

      var
      runOnScroll = false,
      top, left, lastScrollTop, lastScrollLeft,
      scrollHeight, scrollWidth;

      if ( this.vertical && this.domVerticalWrap.style.display !== 'none' ) {

        top = parseFloat( this.domVerticalThumb.style.top ) || 0;

        // 滑块top百分比
        if ( isNumber( scrollTop ) ) {
          this.dom.scrollTop = scrollTop;
          if ( this.isPage ) {
            this.body.scrollTop = scrollTop;
          }
        } else {
          scrollTop = this.dom.scrollTop;
          if ( this.isPage ) {
            scrollTop = this.body.scrollTop;
          }
        }

        this.curScrollTop = this.dom.scrollTop;
        this.curClientHeight = this.scrollBody.clientHeight;
        scrollHeight = this.curScrollHeight = this.scrollBody.scrollHeight;

        if ( !this.isPage && ( this.dom === this.container || ( this.dom !== this.container && contains( this.dom, this.container ) ) ) ) {
          this.domVerticalWrap.style.top = scrollTop + 'px';
        }

        // 滑块大小最小值时计算top百分比
        if ( ~this.domVerticalThumb.style.height.indexOf( 'px' ) ) {
          var
          trackSize = this.getTrackSize( true ),
          trackMiniSize = trackSize - parseInt( this.thumbMiniSize ) + this.getThumbRealSize( true ) / 100;
          this.curScrollTopPercent = toFixed( scrollTop / scrollHeight * trackMiniSize / trackSize, 7, 2 );
          this.domVerticalThumb.style.top = this.curScrollTopPercent + '%';
        }

        // 滑块大小正常值时top百分比
        else {
          this.curScrollTopPercent = toFixed( scrollTop / scrollHeight, 7, 2 );
          this.domVerticalThumb.style.top = this.curScrollTopPercent + '%';
        }
      }

      if (
        this.horizontal && this.domHorizontalWrap.style.display !== 'none' &&
        ( this.vertical && this.domVerticalWrap.style.display === 'none' ) || !this.vertical
      ) {

        left = parseFloat( this.domHorizontalThumb.style.left ) || 0;

        // 滑块top百分比
        if ( isNumber( scrollLeft ) ) {
          this.dom.scrollLeft = scrollLeft;
          if ( this.isPage ) {
            this.body.scrollLeft = scrollLeft;
          }
        } else {
          scrollLeft = this.dom.scrollLeft;
          if ( this.isPage ) {
            scrollLeft = this.body.scrollLeft;
          }
        }

        this.curScrollLeft = this.dom.scrollLeft;
        this.curClientWidth = this.scrollBody.clientWidth;
        scrollWidth = this.curScrollWidth = this.scrollBody.scrollWidth;

        if ( !this.isPage && ( this.dom === this.container || ( this.dom !== this.container && contains( this.dom, this.container ) ) ) ) {
          this.domHorizontalWrap.style.left = scrollLeft + 'px';
        }

        // 滑块大小最小值时计算top百分比
        if ( ~this.domHorizontalThumb.style.width.indexOf( 'px' ) ) {
          var
          trackSize = this.getTrackSize( false ),
          trackMiniSize = trackSize - this.thumbMiniSize + this.getThumbRealSize( false ) / 100;
          this.curScrollLeftPercent = toFixed( scrollLeft / scrollWidth * trackMiniSize / trackSize, 7, 2 );
          this.domHorizontalThumb.style.left = this.curScrollLeftPercent + '%';
        }

        // 滑块大小正常值时top百分比
        else {
          this.curScrollLeftPercent = toFixed( scrollLeft / scrollWidth, 7, 2 );
          this.domHorizontalThumb.style.left = toFixed( scrollLeft / scrollWidth, 7, 2 ) + '%';
        }
      }

      if ( this.vertical && scrollHeight ) {
        this.curScrollTop = this.dom.scrollTop;
        lastScrollTop = toFixed( top * scrollHeight, 0, -2 );
        if (
          ( lastScrollTop < this.maxScrollTop || scrollTop < this.maxScrollTop ) &&
          ( scrollTop > 0 || lastScrollTop > 0 )
        ) {
          runOnScroll = true;
        }
      }

      if ( this.horizontal && scrollWidth ) {
        this.curScrollLeft = this.dom.scrollLeft;
        lastScrollLeft = toFixed( left * scrollWidth, 0, -2 );
        if (
          ( lastScrollLeft < this.maxScrollLeft || scrollLeft < this.maxScrollLeft ) &&
          ( scrollLeft > 0 || lastScrollLeft > 0 )
        ) {
          runOnScroll = true;
        }
      }

      if ( runOnScroll ) {
        this._onScroll( this.curScrollTop, this.curScrollLeft );
      }

      if ( typeof this.onScrollChange === 'function' ) {
        this.onScrollChange();
      }

    },

    _scrollPage: function ( top, left ) {

      var
      runOnScroll = false,
      scrollWidth = this.scrollBody.scrollWidth,
      scrollHeight = this.scrollBody.scrollHeight,
      scrollLeft, scrollTop, lastScrollLeft, lastScrollTop;

      if ( isNumber( top ) ) {

        lastScrollTop = this.dom.scrollTop;

        if ( ~this.domVerticalThumb.style.height.indexOf( 'px' ) ) {
          var
          trackSize = this.getTrackSize( true ),
          trackMiniSize = trackSize - this.thumbMiniSize + this.getThumbRealSize( true ) / 100;
          this.dom.scrollTop = toFixed( top * scrollHeight / trackMiniSize * trackSize, 0, -2 );
        } else {
          this.dom.scrollTop = toFixed( top * scrollHeight, 0, -2 );
        }
        this.curScrollTop = this.dom.scrollTop;
        this.curScrollHeight = this.scrollBody.scrollHeight;
        this.curClientHeight = this.scrollBody.clientHeight;

        if ( !this.isPage && ( this.dom === this.container || ( this.dom !== this.container && contains( this.dom, this.container ) ) ) ) {
          this.domVerticalWrap.style.top = this.dom.scrollTop + 'px';
        }

        if (
          ( lastScrollTop < this.maxScrollTop || this.dom.scrollTop < this.maxScrollTop ) &&
          ( this.dom.scrollTop > 0 || lastScrollTop > 0 )
        ) {
          runOnScroll = true;
        }
      }

      if ( isNumber( left ) ) {

        lastScrollLeft = this.dom.scrollLeft;

        if ( ~this.domHorizontalThumb.style.height.indexOf( 'px' ) ) {
          var
          trackSize = this.getTrackSize( false ),
          trackMiniSize = trackSize - this.thumbMiniSize + this.getThumbRealSize( false ) / 100;
          this.dom.scrollLeft = toFixed( left * scrollWidth / trackMiniSize * trackSize, 0, -2 );
        } else {
          this.dom.scrollLeft = toFixed( left * scrollWidth, 0, -2 );
        }
        this.curScrollLeft = this.dom.scrollLeft;
        this.curScrollWidth = this.scrollBody.scrollWidth;
        this.curClientWidth = this.scrollBody.clientWidth;

        if ( !this.isPage && ( this.dom === this.container || ( this.dom !== this.container && contains( this.dom, this.container ) ) ) ) {
          this.domHorizontalWrap.style.left = this.dom.scrollLeft + 'px';
        }

        if (
          ( lastScrollLeft < this.maxScrollLeft || this.dom.scrollLeft < this.maxScrollLeft ) &&
          ( this.dom.scrollLeft > 0 || lastScrollLeft > 0 )
        ) {
          runOnScroll = true;
        }
      }

      if ( runOnScroll ) {
        this._onScroll( lastScrollTop, lastScrollLeft );
      }
    },

    _addDrag: function () {
      var that = this;

      if ( this.vertical ) {
        this.VerticalThumbDrag = Drag( {
          axis: 'y',
          target: this.domVerticalThumb,
          container: this.domVerticalWrap,
          minTop: 0,
          maxTop: function () {

            var
            scrollHeight = that.scrollBody.scrollHeight,
            clientHeight = that.scrollBody.clientHeight,
            scrollTop = scrollHeight - clientHeight;

            // 滑块大小最小值时计算top百分比
            if ( ~that.domVerticalThumb.style.height.indexOf( 'px' ) ) {
              var
              trackSize = that.getTrackSize( true ),
              trackMiniSize = trackSize - that.thumbMiniSize + that.getThumbRealSize( true ) / 100;
              return toFixed( scrollTop / scrollHeight * trackMiniSize / trackSize, 7, 2 );
            }

            // 滑块大小正常值时top百分比
            else {
              return toFixed( scrollTop / scrollHeight, 7, 2 );
            }
          },
          onDrag: function ( top ) {
            that._scrollPage( top );
          }
        } );
      }

      if ( this.horizontal ) {
        this.HorizontalThumbDrag = Drag( {
          axis: 'x',
          target: this.domHorizontalThumb,
          container: this.domHorizontalWrap,
          minLeft: 0,
          maxLeft: function () {
            var
            scrollWidth = that.scrollBody.scrollWidth,
            clientWidth = that.scrollBody.clientWidth,
            scrollLeft = scrollWidth - clientWidth;

            // 滑块大小最小值时计算top百分比
            if ( ~that.domHorizontalThumb.style.height.indexOf( 'px' ) ) {
              var
              trackSize = that.getTrackSize( false ),
              trackMiniSize = trackSize - this.thumbMiniSize + that.getThumbRealSize( false ) / 100;
              return toFixed( scrollLeft / scrollWidth * trackMiniSize / trackSize, 7, 2 );
            }

            // 滑块大小正常值时top百分比
            else {
              return toFixed( scrollLeft / scrollWidth, 7, 2 );
            }
          },
          onDrag: function ( top, left ) {
            that._scrollPage( undefined, left );
          }
        } );
      }

      if ( TOUCH && this.pageDragAxis ) {
        var i, l, leftPercent, topPercent,
        domlist = this.pageDragDom;
        if ( !this.pageDragDom || !this.pageDragDom.length ) {
          domlist = [ this.dom ];
        }
        this.PageDrag = [];
        for ( i = 0, l = domlist.length; i < l; i ++ ) {
          this.PageDrag.push( Drag( {
            axis: domlist[ i ] == this.dom ? this.pageDragAxis : 'y',
            target: domlist[ i ],
            moveTarget: false,
            onDragStart: function ( e ) {
              if ( isFunction( that.pageDragStartCallBack ) ) {
                that.pageDragStartCallBack( e );
              }
            },
            onDragEnd: function ( e ) {
              if ( isFunction( that.pageDragEndCallBack ) ) {
                that.pageDragEndCallBack( e );
              }
            },
            onDrag: function ( top, left, e ) {
              if ( isFunction( that.pageDragCallBack ) ) {
                that.pageDragCallBack( top, left, e );
              }
            }
          } ) );
        }
      }
    },

    _removeDrag: function () {
      if ( this.VerticalThumbDrag ) {
        this.VerticalThumbDrag.destroy();
        this.VerticalThumbDrag = null;
      }
      if ( this.HorizontalThumbDrag ) {
        this.HorizontalThumbDrag.destroy();
        this.HorizontalThumbDrag = null;
      }
    },

    // 添加滚轮事件
    _addWheelEvent: function ( dom ) {

      var that = this;
      dom = dom || this.dom;

      if ( this.isFirefox ) {

        // 火狐
        on( dom, 'DOMMouseScroll', function ( e ) {
          that._onWheel( e );
          if ( !that._isTop() && !that._isBottom() ) {
            e.preventDefault();
          }
          e.stopPropagation();
        } );
      } else {

        // IE Chrome Safari
        on( dom, 'mousewheel', function ( e ) {
          that._onWheel( e );
          if ( !that._isTop() && !that._isBottom() ) {
            e.preventDefault();
          }
          e.stopPropagation();
        } );
      }
    },

    // 删除滚轮事件
    _removeWheelEvent: function ( dom ) {
      if ( this.isFirefox )
        off( dom, 'DOMMouseScroll' );
      else
        off( dom, 'mousewheel' );
    },

    // 滚动方向 true 向上 false 向下
    _getDirection: function ( e ) {
      if ( e.wheelDelta !== void 0 ) return e.wheelDelta > 0;
      return e.detail < 0;
    },

    _moveing: function ( direc, isVertical ) {

      // 设置方向
      direc = direc ? -1 : 1;

      // 方向与上帧不同
      if ( this._direc !== direc ) {
        this._direc = direc;
        this.aminTimer && clearInterval( this.aminTimer );
        this.aminTimer = null;
        this.v = 0;
      }

      // 有动画在执行则退出
      if ( this.aminTimer ) return;

      var that = this;

      // 滑块帧动画
      this.aminTimer = setInterval( function () {
        var
        cutT = + new Date(),
        t = cutT < that.scrollTopEndT
          ? ( cutT - that.scrollTopStartT ) / ( that.scrollTopEndT - that.scrollTopStartT )
          : 1,

        // 每帧页面滚动量
        e = that._deta * ( 1 - that.easing( t ) ) * that._direc;

        if ( isVertical ) {
          that.resetPosition( Math.max( 0, Math.min( toFixed( that.curScrollTop + e ), that.maxScrollTop ) ) );
        }
        else {
          that.resetPosition( false , Math.max( 0, Math.min( toFixed( that.curScrollLeft + e ), that.maxScrollLeft ) ) );
        }

        // 缓存速度
        that.v = e;

        // 滚动结束
        if (
          t === 1 ||
          ( isVertical ?  that._isTop() || that._isBottom() : that._isLeft() || that._isRight() )
        ) {
          that.v = 0;

          // 缓存位置
          // that.curScrollTop = that.dom.scrollTop;
          // that.curScrollLeft = that.dom.scrollLeft;

          clearInterval( that.aminTimer );
          that.aminTimer = null;
        }
      }, this.aminInterval );
    },


    moveingTo: function ( position, isVertical ) {

      var that = this;

      if ( isVertical ) {
        if ( position >= this.maxScrollTop && this.maxScrollTop == this.curScrollTop ) {
          return;
        }
        if ( position <= 0 && this.curScrollTop  == 0 ) {
          return;
        }
        if ( position > this.maxScrollTop ) position = this.maxScrollTop;
        this._deta = position - this.curScrollTop / 8;
      } else {
        if ( position >= this.maxScrollLeft && this.maxScrollLeft == this.curScrollLeft ) {
          return;
        }
        if ( position <= 0 && this.curScrollLeft  == 0 ) {
          return;
        }
        if ( position > this.maxScrollLeft ) position = this.maxScrollLeft;
        this._deta = position - this.curScrollLeft / 8;
      }

      if ( this.aminTimer ) return;

      // 滑块帧动画
      this.aminTimer = setInterval( function () {

        var distance,

        // 每帧页面滚动量
        e = that._deta;

        if ( isVertical ) {
          if ( Math.abs( position - that.curScrollTop ) < Math.abs( e ) ) {
            distance = Math.min( position, that.maxScrollTop );
          } else {
            distance = Math.min( toFixed( that.curScrollTop + e ), that.maxScrollTop );
          }
          that.resetPosition( Math.max( 0, distance ) );
        } else {
          if ( Math.abs( position - that.curScrollLeft ) < Math.abs( e ) ) {
            distance = Math.min( position, that.maxScrollLeft );
          } else {
            distance = Math.min( toFixed( that.curScrollLeft + e ), that.maxScrollLeft );
          }
          that.resetPosition( false , Math.max( 0, distance ) );
        }

        // 缓存速度
        that.v = e;

        // 滚动结束
        if (
          distance == position ||
          ( isVertical ?  that._isTop() || that._isBottom() : that._isLeft() || that._isRight() )
        ) {
          clearInterval( that.aminTimer );
          that.aminTimer = null;
          that.v = 0;
        }

      }, this.aminInterval );
    },

    // 滚轮回调事件
    _onWheel: function ( e ) {
      // e.preventDefault();

      var
      direc = this._getDirection( e ),
      speed = !direc ? this.speed : 0 - this.speed;

      if ( this.vertical ) {
        if ( this.amin ) {

          var
          detaTime = 1,
          now = + new Date();

          if ( this.scrollTopEndT && this.scrollTopEndT > now ) {
            detaTime = ( this.scrollTopEndT - now ) / 1000;
          }

          // 滑块速度从O开始时间点
          if ( this.v === 0 || this._direc !== ( direc ? -1 : 1 ) || detaTime < 0.5 ) {
            this._scrollTimes = 0;
          }

          // 本次滑动开始时间点
          this.scrollTopStartT = now;

          // 本次结束时间点
          this.scrollTopEndT = this.scrollTopStartT + 1000;

          this._scrollTimes += 1;

          // 滚动系数
          this._deta =

            // 惯性系数
            this.inertialCoefficient *

            // 速度
            this.speed *

            // 多次滚动的位移倍数
            Math.max( 1, Math.min( 100 / this.getThumbPercent( true ), this._scrollTimes * detaTime ) );

          // 运行滑动动画
          this._moveing( direc, true );

        } else {

          // 关闭滑动动画时直接计算页面滑动量
          this.dom.scrollTop += speed;
        }
      }

      // if ( !this.amin ) {

        // 缓存位置
        // this.curScrollTop = this.dom.scrollTop;
      // }

    },

    // 页面滚动回调
    _onScroll: function ( lastScrollTop, lastScrollLeft ) {
      //this.resetPosition();

      // 自定义滚动回调
      if ( typeof this.onScroll === 'function' ) this.onScroll( lastScrollTop, lastScrollLeft );
    },

    // 判断有无滚动条
    _haveScroll: function ( isVertical ) {
      /*var scroll = direction !== false ? 'scrollTop' : 'scrollLeft';
      this.dom[ scroll ] ++;
      return this.dom[ scroll ] -- > 0;*/
      var
      dom = this.dom,
      direc = isVertical !== false
        ? [ 'scrollTop', 'scrollHeight', 'clientHeight' ]
        : [ 'scrollLeft', 'scrollWidth', 'clientWidth' ];
      if ( this.isPage ) {
        return this.docElem[ direc[ 1 ] ] > this.docElem[ direc[ 2 ] ] || dom[ direc[ 0 ] ] > 0;
      }
      else {
        return dom[ direc[ 1 ] ] > dom[ direc[ 2 ] ] || dom[ direc[ 0 ] ] > 0;
      }
    },

    // 滚动条边缘判断
    _isTop: function ( scrollTop ) {
      // if ( !this._haveScroll() ) { return true; }
      scrollTop = scrollTop ||
          ( ~~this.curScrollTop >= 0 ? this.curScrollTop : this.dom.scrollTop );
      return scrollTop <= 1
    },

    _isBottom: function ( scrollTop ) {
      scrollTop = scrollTop ||
          ( ~~this.curScrollTop >= 0 ? this.curScrollTop : this.dom.scrollTop );
      return scrollTop === this.curScrollHeight - this.curClientHeight;
    },

    _isLeft: function ( scrollLeft ) {
      // if ( !this._haveScroll( false ) ) { return true; }
      scrollLeft = scrollLeft ||
          ( ~~this.curScrollLeft >= 0 ? this.curScrollLeft : this.dom.scrollLeft );
      return scrollLeft <= 1
    },

    _isRight: function ( scrollLeft ) {
      scrollLeft = scrollLeft ||
          ( ~~this.curScrollLeft >= 0 ? this.curScrollLeft : this.dom.scrollLeft );
      return scrollLeft === this.curScrollWidth - this.curClientWidth;
    },

    // 判断是否定位
    _isPosition: function ( dom ) {
      dom = dom || this.dom;
      if ( this.isPage ) return true;
      return getStyle( dom, 'position' ) !== 'static';
    },

    // 自我删除
    _remove: function ( dom ) {
      dom.parentNode.removeChild( dom );
    },

    // 销毁
    destroy: function () {
      if ( this.aminTimer ) { clearInterval( this.aminTimer ); }
      if ( this.watcher ) { clearInterval( this.watcher ); }
      this._removeWheelEvent( this.dom );
      if ( this.vertical ) {
        this._remove( this.domVerticalWrap );
      }
      if ( this.horizontal ) {
        this._remove( this.domHorizontalWrap );
      }
      for ( var k in this ) {
        if ( /^style_/.test( k ) ) {
          var
          list = k.split( '_' ),
          style = this[ k ];
          this[ list[ 1 ] ].style[ list[ 2 ] ] = style;
        }
      }
      this.aminTimer = null;
      this.watcher = null;
    }
  };

  return PrototypeScrollBar;

//} );