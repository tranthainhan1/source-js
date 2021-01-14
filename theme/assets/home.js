(() => {
  "use strict";
  class e {
    constructor() {
      this.hehe = 123;
    }
  }
  (() => {
    window.Test = e;
    let s = new e();
    console.log(s.hehe);
  })();
})();
//# sourceMappingURL=home.js.map
