
import is from 'whatitis';
import getWindow from './getWindow';

export default function parentNode( dom, condition ) {
  const parent = dom.parentNode;
  if ( is.Function( condition )) {
    return parent && condition( parent ) === true
      ? parent : parent ? parentNode( parent, condition ) : null;
  }
  return parent || getWindow( dom );
}
