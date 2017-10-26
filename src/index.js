
import compose from './utils/compose';
import getScope from './scope';
import init from './init';


function OverScroll( scope ) {

  const { mode, animation, position: initialPosition, onDestroy, onInit } = scope;
  const { scrollTo, position, scrollToSection } = animation.run();

  if ( mode === 'scroll' ) {
    scrollTo( ...initialPosition, true );
  }

  if ( mode === 'section' ) {
    scrollToSection( initialPosition, true );
  }

  // 初始化事件
  onInit();

  return {
    position,
    scrollTo: mode === 'scroll' ? scrollTo : scrollToSection,
    destroy: onDestroy
  };
}

export default compose( OverScroll, init, getScope );
