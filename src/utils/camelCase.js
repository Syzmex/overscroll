
const camelCaseRE = /-(\w)/g;

export default function camelCase( str ) {
  return str.replace( camelCaseRE, ( _, b ) => b.toUpperCase());
}
