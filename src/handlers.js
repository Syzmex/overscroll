
import compose from './utils/compose';

const noop = () => {};

export function handler( name ) {
  return function( scope ) {
    const func = scope[name];
    scope[name] = func || noop;
    return function( callback ) {
      scope[name] = func !== noop ? compose( func, callback ) : callback;
    };
  };
}

export const handleDestroy = handler( 'onDestroy' );
export const handleBeforeScroll = handler( 'onBeforeScroll' );
export const handleAfterScroll = handler( 'onAfterScroll' );
export const handleScroll = handler( 'onScroll' );
