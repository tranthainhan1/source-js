const { default: AT } = require("./arn");

//NodeList
Object.assign(NodeList.prototype, {
  removeClass: function () {
    for (const item of this) {
      item.classList.remove(...arguments);
    }
  },
  addClass: function () {
    for (const item of this) {
      item.classList.add(...arguments);
    }
  },
  addEvent: function (...args) {
    for (const item of this) {
      item.addEventListener(...args);
    }
  },
  removeEvent: function (...args) {
    for (const item of this) {
      item.removeEventListener(...args);
    }
  },
});

// HTMLCollection
Object.assign(HTMLCollection.prototype, {
  removeClass: function () {
    for (const item of this) {
      item.classList.remove(...arguments);
    }
  },
  addClass: function () {
    for (const item of this) {
      item.classList.add(...arguments);
    }
  },
  addEvent: function (...args) {
    for (const item of this) {
      item.addEventListener(...args);
    }
  },
  removeEvent: function (...args) {
    for (const item of this) {
      item.removeEventListener(...args);
    }
  },
});

// HTMLElement
Object.assign(HTMLElement.prototype, {
  removeClass: function (...args) {
    this.classList.remove(...args);
  },
  addClass: function (...args) {
    this.classList.add(...args);
  },
  addEvent: function (...args) {
    this.addEventListener(...args);
  },
  removeEvent: function (eventName, cb) {
    this.removeEventListener(eventName, cb);
  },
  hasClass: function (className) {
    return this.classList.contains(className);
  },
});

(function () {
  let nativeFetch = window.fetch;
  window.fetch = function (...args) {
    let url = args[0];
    let promise;
    switch (url) {
      case "/cart/add.js":
        promise = nativeFetch(...args).then(async (response) => {
          response
            .clone()
            .json()
            .then((product) => {
              nativeFetch(
                `${theme.url.recommendations}?section_id=product-recommendations&product_id=${product.product_id}`
              )
                .then((res) => res.text())
                .then((content) => {
                  theme.loadCartNotity && document.dispatchEvent(new CustomEvent("cartNotifyDestroy"));
                  document.dispatchEvent(new CustomEvent("cartNotify", { detail: { product, recommend: content } }));
                });
            });
          nativeFetch("/cart.js")
            .then((res) => res.json())
            .then((cart) => {
              AT.cart = cart;
              document.dispatchEvent(new CustomEvent("cartChange", { detail: cart }));
            });

          return response;
        });
        break;
      default:
        promise = nativeFetch(...args);
    }
    return promise;
  };
})();
