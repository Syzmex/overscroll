
export const getOffset = ({ win, body, html }) => ( node ) => {
  const box = node.getBoundingClientRect();

  // < ie8 不支持 win.pageXOffset, 则使用 html.scrollLeft
  return {
    left: box.left + ( win.pageXOffset || html.scrollLeft ) -
      ( html.clientLeft || body.clientLeft || 0 ),
    top: box.top + ( win.pageYOffset || html.scrollTop ) -
      ( html.clientTop || body.clientTop || 0 )
  };
};

export const getPosition = ( scope ) => ( node ) => {
  // if ( node.parentNode === scope.body ) {
  //   return getOffset( scope )( node );
  // }

  const parent = node.parentNode;
  const parentOffset = getOffset( scope )( parent );
  const offset = getOffset( scope )( node );

  return {
    left: offset.left - parentOffset.left,
    top: offset.top - parentOffset.top
  };
};
