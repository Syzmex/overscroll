
function returnFalse() {
  return false;
}

function returnTrue() {
  return true;
}

class EventBaseObject {

  constructor() {
    this.timeStamp = +new Date();
    this.target = undefined;
    this.currentTarget = undefined;
    this.isDefaultPrevented = returnFalse;
    this.isPropagationStopped = returnFalse;
    this.isImmediatePropagationStopped = returnFalse;
  }

  preventDefault() {
    this.isDefaultPrevented = returnTrue;
  }

  stopPropagation() {
    this.isPropagationStopped = returnTrue;
  }

  stopImmediatePropagation() {
    this.isImmediatePropagationStopped = returnTrue;
    // fixed 1.2
    // call stopPropagation implicitly
    this.stopPropagation();
  }

  halt( immediate ) {
    if ( immediate ) {
      this.stopImmediatePropagation();
    } else {
      this.stopPropagation();
    }
    this.preventDefault();
  }
}

export default EventBaseObject;
