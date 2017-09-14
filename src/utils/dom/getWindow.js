
import is from 'whatitis';

export default function getWindow( dom ) {
  const doc = is.Document( dom ) ? dom : getDocument( dom );
  return doc.defaultView || window;
}
