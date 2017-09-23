
import overscroll from '../src/index';
// import getScrollBarSzie from '../src/utils/getScrollBarSize';
overscroll({
  mode: 'section',
  target: window.root,
  anchors: Array.prototype.slice.call( window.root.children ),
  onBeforeScroll: ( e ) => {
    console.log('onBeforeScroll' )
  },
  onAfterScroll: ( e ) => {
    console.log('onAfterScroll' )
  },
  onScroll: ( e ) => {
    console.log( 'onScroll' );
  }
});
overscroll({
  // axis: 'x',
  target: window.scrolltest,
  onBeforeScroll: ( e ) => {
    // console.log('onBeforeScroll', e )
  },
  onAfterScroll: ( e ) => {
    // console.log('onAfterScroll', e )
  },
  onScroll: ( e ) => {
    // console.log( e );
  }
});
overscroll({
  axis: 'x',
  mode: 'section',
  target: document.getElementById( 'scroll-x' ),
  anchors: Array.prototype.slice.call( document.getElementById( 'scroll-x' ).children ),
  onBeforeScroll: ( e ) => {
    // console.log('onBeforeScroll', e )
  },
  onAfterScroll: ( e ) => {
    // console.log('onAfterScroll', e )
  },
  onScroll: ( e ) => {
    // console.log( e );
  }
});
// console.log(getScrollBarSzie())
