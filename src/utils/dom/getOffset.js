
export const getOffset = ({ win, doc, body, html }) => ( node ) => {
  const box = node.getBoundingClientRect();
  // 标准模式
  const isCSS1Compat = (( doc.compatMode || '' ) === 'CSS1Compat' );
  // pageXOffset 属性是 scrollX 属性的别名 IE < 9 两个属性都不支持
  return {
    left: box.left + ( win.pageXOffset || ( isCSS1Compat ? html : body ).scrollLeft ) - ( html.clientLeft || body.clientLeft || 0 ),
    top: box.top + ( win.pageYOffset || ( isCSS1Compat ? html : body ).scrollTop ) - ( html.clientTop || body.clientTop || 0 )
  };
};

export const getPosition = ( scope ) => ( node ) => {
  if ( node === scope.html ) {
    return getOffset( scope )( node );
  }
  const parent = node.parentNode;
  const offsetFn = getOffset( scope );
  const parentOffset = offsetFn( parent );
  const offset = offsetFn( node );

  return {
    left: offset.left - parentOffset.left,
    top: offset.top - parentOffset.top
  };
};
