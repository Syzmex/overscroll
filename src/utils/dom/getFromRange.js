
export default ( min, max ) => ( number ) => {
  return Math.min( max, Math.max( min, number ));
};
