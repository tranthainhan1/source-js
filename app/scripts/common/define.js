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
  forEach: Array.prototype.forEach,
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

//String
Object.assign(String.prototype, {
  toHTML: function () {
    let div = document.createElement("div");
    div.innerHTML = this;
    return div.children;
  },
  toCurrency: moneyFormat,
});

//Number
Object.assign(Number.prototype, {
  toCurrency: moneyFormat,
});

var moneyFormatString = theme.currency.format;

function moneyFormat(format) {
  let cents = this;
  if (typeof cents === "string") {
    cents = cents.replace(".", "");
  }
  var value = "";
  var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
  var formatString = format || moneyFormatString;

  function formatWithDelimiters(number, precision, thousands, decimal) {
    thousands = thousands || ",";
    decimal = decimal || ".";

    if (isNaN(number) || number === null) {
      return 0;
    }

    number = (number / 100.0).toFixed(precision);

    var parts = number.split(".");
    var dollarsAmount = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1" + thousands);
    var centsAmount = parts[1] ? decimal + parts[1] : "";

    return dollarsAmount + centsAmount;
  }

  switch (formatString.match(placeholderRegex)[1]) {
    case "amount":
      value = formatWithDelimiters(cents, 2);
      break;
    case "amount_no_decimals":
      value = formatWithDelimiters(cents, 0);
      break;
    case "amount_with_comma_separator":
      value = formatWithDelimiters(cents, 2, ".", ",");
      break;
    case "amount_no_decimals_with_comma_separator":
      value = formatWithDelimiters(cents, 0, ".", ",");
      break;
    case "amount_no_decimals_with_space_separator":
      value = formatWithDelimiters(cents, 0, " ");
      break;
    case "amount_with_apostrophe_separator":
      value = formatWithDelimiters(cents, 2, "'");
      break;
  }

  return formatString.replace(placeholderRegex, value);
}

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
