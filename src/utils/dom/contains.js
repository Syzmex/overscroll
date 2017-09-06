
// 检测 parentNode 元素包含 childNode 元素
export default function contains( parentNode, childNode ) {
  // 标准浏览器支持compareDocumentPosition
  if ( parentNode.compareDocumentPosition ) {
    return !!( parentNode.compareDocumentPosition( childNode ) & 16 );
  }

  // IE支持contains
  else if ( parentNode.contains ) {
    return parentNode !== childNode && parentNode.contains( childNode );
  }

  return false;
}
