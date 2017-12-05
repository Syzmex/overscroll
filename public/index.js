
import overscroll from '../src/index';
// import getScrollBarSzie from '../src/utils/getScrollBarSize';
overscroll({
  position: 2,
  // mode: 'section',
  target: window.root,
  onBeforeScroll: ( e ) => {
    console.log('onBeforeScroll', e.section )
  },
  onAfterScroll: ( e ) => {
    console.log('onAfterScroll', e.section )
  },
  onScroll: ( e ) => {
    console.log( 'onScroll:', e.section );
  },
  onInit: ( e ) => {
    console.log( 'onScroll:', e.section );
  }
});
overscroll({
  // axis: 'x',
  target: window.scrolltest,
  // onBeforeScroll: ( e ) => {
  //   console.log('onBeforeScroll' )
  // },
  // onAfterScroll: ( e ) => {
  //   console.log('onAfterScroll' )
  // },
  // onScroll: ( e ) => {
  //   console.log( 'onScroll:', e );
  // }
});
overscroll({
  axis: 'x',
  mode: 'section',
  target: document.getElementById( 'scroll-x' )
  // onBeforeScroll: ( e ) => {
  //   // console.log('onBeforeScroll', e )
  // },
  // onAfterScroll: ( e ) => {
  //   // console.log('onAfterScroll', e )
  // },
  // onScroll: ( e ) => {
  //   // console.log( e );
  // }
});
overscroll({
  axis: 'y',
  target: document.getElementById( 'scroll-y' )
  // onBeforeScroll: ( e ) => {
  //   // console.log('onBeforeScroll', e )
  // },
  // onAfterScroll: ( e ) => {
  //   // console.log('onAfterScroll', e )
  // },
  // onScroll: ( e ) => {
  //   // console.log( e );
  // }
});
// console.log(getScrollBarSzie())
