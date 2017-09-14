
const hyphenateRE = /([a-z\d])([A-Z])/g;

export default function hyphenate( str ) {
  return str.replace( hyphenateRE, '$1-$2' ).toLowerCase();
}
