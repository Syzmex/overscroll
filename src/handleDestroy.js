
import compose from './utils/compose';

export default function handleDestory( scope ) {
  scope.destroy = null;
  return function( callback ) {
    scope.destroy = scope.destroy ? compose( scope.destroy, callback ) : callback;
  };
}
