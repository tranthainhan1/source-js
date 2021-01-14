import { Test } from "./common/model";

(() => {
  window.Test = Test;
  let a = new Test();
  console.log(a.hehe);
})();
