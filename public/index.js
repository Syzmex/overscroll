
import overscroll from '../src/index';
// import getScrollBarSzie from '../src/utils/getScrollBarSize';
overscroll({
  mode: 'section',
  target: window.root,
  anchors: Array.prototype.slice.call( window.root.children ),
  onScroll: ( e ) => {
    console.log( e );
  }
});
// console.log(getScrollBarSzie())
