
// import camelCase from '../camelCase';
import hyphenate from '../hyphenate';

export const setData = ( dom, name, value = '' ) => {
  if ( dom.dataset ) {
    dom.dataset[name] = value;
  } else {
    dom.setAttribute( `data-${hyphenate( name )}`, value );
  }
};

export const getData = ( dom, name ) => {
  if ( dom.dataset ) {
    return dom.dataset[name];
  }
  return dom.getAttribute( `data-${hyphenate( name )}` );
};

export const hasData = ( dom, name ) => {
  if ( dom.dataset ) {
    return Object.keys( dom.dataset ).includes( name );
  }
  return dom.hasAttribute( `data-${hyphenate( name )}` );
};

export const removeData = ( dom, name ) => {
  if ( dom.dataset ) {
    delete dom.dataset[name];
  } else {
    dom.removeAttribute( `data-${hyphenate( name )}` );
  }
};

export default { setData, getData, hasData, removeData };
