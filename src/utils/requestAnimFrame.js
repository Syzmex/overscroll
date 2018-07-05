
import { requestAnimationFrame, cancelAnimationFrame } from './polyfill/requestAnimationFrame';


export function requestAnimFrame( callback ) {

  const id = requestAnimationFrame( function frameCallback( time ) {
    callback( time );
    id = requestAnimationFrame( frameCallback );
  });

  return { cancel: () => cancelAnimationFrame( id ) };
}
