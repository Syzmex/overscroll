
import is from 'whatitis';


const PIXEL_PATTERN = /margin|padding|width|height|max|min|offset/;

const removePixel = {
  left: true,
  top: true
};
const floatMap = {
  cssFloat: 1,
  styleFloat: 1,
  float: 1
};

function getComputedStyle( node ) {
  return node.nodeType === 1 ?
    node.ownerDocument.defaultView.getComputedStyle( node, null ) : {};
}

function getStyleValue( node, type, value ) {
  type = type.toLowerCase();
  if ( value === 'auto' ) {
    if ( type === 'height' ) {
      return node.offsetHeight;
    }
    if ( type === 'width' ) {
      return node.offsetWidth;
    }
  }
  if ( !( type in removePixel )) {
    removePixel[type] = PIXEL_PATTERN.test( type );
  }
  return removePixel[type] ? ( parseFloat( value ) || 0 ) : value;
}

export function get( node, name ) {
  const length = arguments.length;
  const style = getComputedStyle( node );

  name = floatMap[name] ? 'cssFloat' in node.style ? 'cssFloat' : 'styleFloat' : name;

  return ( length === 1 ) ? style : getStyleValue( node, name, style[name] || node.style[name]);
}

export function set( node, name, value ) {
  const length = arguments.length;
  name = floatMap[name] ? 'cssFloat' in node.style ? 'cssFloat' : 'styleFloat' : name;
  if ( length === 3 ) {
    if ( typeof value === 'number' && PIXEL_PATTERN.test( name )) {
      value = `${value}px`;
    }
    node.style[name] = value; // Number
    return value;
  }
  if ( is.PlainObject( name )) {
    Object.entries( name ).forEach(([ key, value ]) => {
      set( node, key, value );
    });
  }
  // for ( const x in name ) {
  //   if ( name.hasOwnProperty( x )) {
  //     set( node, x, name[x]);
  //   }
  // }
  return getComputedStyle( node );
}
