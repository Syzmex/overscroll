
const root = window;
const vendors = [ 'moz', 'webkit' ];
const suffix = 'AnimationFrame';
let raf = root[`request${suffix}`];
let caf = root[`cancel${suffix}`] || root[`cancelRequest${suffix}`];

for ( let i = 0; !raf && i < vendors.length; i++ ) {
  const prefix = vendors[i];
  raf = root[`${prefix}Request${suffix}`];
  caf = root[`${prefix}Cancel${suffix}`]
    || root[`${prefix}CancelRequest${suffix}`];
}

root.requestAnimationFrame = raf;
root.cancelAnimationFrame = caf;

export const requestAnimationFrame = raf;
export const cancelAnimationFrame = caf;
