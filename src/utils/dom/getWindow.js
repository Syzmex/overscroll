
import is from 'whatitis';
import getDocument from './getDocument';

export default function getWindow( dom ) {
  const doc = is.Document( dom ) ? dom : getDocument( dom );
  // 兼容 FF 低版本
  return doc.defaultView || window;
}
