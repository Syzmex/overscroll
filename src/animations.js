
import animScroll from './animScroll';
import animSection from './animSection';

export default ( scope ) => {

  let animation;
  const { mode } = scope;

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
