
import DomEventObject from './EventObject';

export default function addEventListener( target, eventType, callback, useCapture = false ) {

  function wrapCallback( e ) {
    const ne = new DomEventObject( e );
    callback.call( target, ne );
  }

  if ( target.addEventListener ) {
    target.addEventListener( eventType, wrapCallback, useCapture );
    return {
      remove() {
        target.removeEventListener( eventType, wrapCallback, useCapture );
      }
    };
  } else if ( target.attachEvent ) {
    target.attachEvent( `on${eventType}`, wrapCallback );
    return {
      remove() {
        target.detachEvent( `on${eventType}`, wrapCallback );
      }
    };
  }

  target[`on${eventType}`] = wrapCallback;
  return {
    remove() {
      target[`on${eventType}`] = null;
    }
  };
}
