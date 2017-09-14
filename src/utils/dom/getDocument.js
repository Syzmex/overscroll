
import is from 'whatitis';

export default function getDocument( dom ) {
  return is.Element( dom ) ? dom.ownerDocument : document;
}
