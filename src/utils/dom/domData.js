
import hyphenate from '../hyphenate';

function firstCharToLowerCase( str ) {
  const firstChar = str.charAt( 0 );
  if ( /^[A-Z]$/.test( str.charAt( 0 ))) {
    return firstChar.toLowerCase() + str.slice( 1 );
  }
  return str;
}

export const setData = ( dom, name, value = '' ) => {
  if ( dom.dataset ) {
    dom.dataset[firstCharToLowerCase( name )] = value;
  } else {
    dom.setAttribute( `data-${hyphenate( name )}`, value );
  }
};

export const getData = ( dom, name ) => {
  if ( dom.dataset ) {
    return dom.dataset[firstCharToLowerCase( name )];
  }
  return dom.getAttribute( `data-${hyphenate( name )}` );
};

export const hasData = ( dom, name ) => {
  if ( dom.dataset ) {
    return Object.keys( dom.dataset ).includes( firstCharToLowerCase( name ));
  }
  return dom.hasAttribute( `data-${hyphenate( name )}` );
};

export const removeData = ( dom, name ) => {
  if ( dom.dataset ) {
    delete dom.dataset[firstCharToLowerCase( name )];
  } else {
    dom.removeAttribute( `data-${hyphenate( name )}` );
  }
};

export default { setData, getData, hasData, removeData };
