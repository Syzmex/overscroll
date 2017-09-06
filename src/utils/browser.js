
export default ( function() {
  try {
    const userAgent = navigator.userAgent.toLowerCase();
    const toArray = ( some ) => {
      return !Array.isArray( some ) ? [some] : some;
    };
    const regexps = {
      ie: [ /rv:([\d.]+)\) like gecko/, /msie ([\d.]+)/ ],
      firefox: /firefox\/([\d.]+)/,
      chrome: /chrome\/([\d.]+)/,
      opera: /opera.([\d.]+)/,
      safari: /version\/([\d.]+).*safari/
    };
    return Object.entries( regexps ).reduce(( env, [ key, regexps ]) => {
      toArray( regexps )
        .map(( regexp ) => userAgent.match( regexp ))
        .filter(( s ) => s )
        .forEach(( s ) => {
          env[key] = parseFloat( s[1]);
        });
      return env;
    }, {});
  } catch ( e ) {
    return {};
  }
}());
