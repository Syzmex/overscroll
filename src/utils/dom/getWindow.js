
import is from 'whatitis';
import getDocument from './getDocument';

export default function getWindow( dom ) {
  const doc = is.Document( dom ) ? dom : getDocument( dom );
  return doc.defaultView || window;
}
