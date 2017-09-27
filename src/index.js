
import compose from './utils/compose';
import getScope from './scope';
import init from './init';


function OverScroll( scope ) {

  const { mode, animation, position: initialPosition, onDestroy, onInit } = scope;
  const { scrollTo, position, scrollToSection } = animation.run();

  // setTimeout(() => {
  //   // scrollTo( 0, 500 );
  //   if ( scrollTo ) {
  //     scrollTo(1000)
  //   }
  // //   // setTimeout(() => {
  // //   //   scrollTo( 0, 0 );
  // //   // }, 500 );
  // }, 1000 );

  if ( mode === 'scroll' ) {
    scrollTo( ...initialPosition, true );
  } else {
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
