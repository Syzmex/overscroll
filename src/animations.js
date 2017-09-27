
import animScroll from './animScroll';
import animSection from './animSection';

export default ( scope ) => {

  let animation;
  const { mode, overscroll, handleBeforeScroll, handleAfterScroll } = scope;

  handleBeforeScroll(() => {
    overscroll.scrolling = true;
  });

  handleAfterScroll(() => {
    overscroll.scrolling = false;
  });

  if ( mode === 'scroll' ) {
    animation = animScroll( scope );
  }

  if ( mode === 'section' ) {
    animation = animSection( scope );
  }

  return {
    animation
  };
};
