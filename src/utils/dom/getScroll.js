

import is from 'whatitis';

export const getScroll = ({ html, body }) => () => {
  return {
    scrollLeft: Math.max( html.scrollLeft, body.scrollLeft ),
    scrollTop: Math.max( html.scrollTop, body.scrollTop )
  };
};
