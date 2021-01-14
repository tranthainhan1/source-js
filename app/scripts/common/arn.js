import { getSizedImageUrl } from "@shopify/theme-images";
let AT = {
  eventContainers: {},
  cart: {},
  debounce: (func, wait) => {
    let timeout;
    return function (...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  initTNS: function (container) {
    let tnsContainer = container.getElementsByClassName("js-tns")[0];
    let controlsContainer = container.getElementsByClassName("js-tns-controls")[0];
    let configId = tnsContainer.getAttribute("data-config");

    let config = (!!configId && JSON.parse(document.getElementById(configId).innerHTML)) || {};

    if (!!config.controls) {
      config.controlsContainer = controlsContainer;
    }
    if (config.itemClass !== "" && typeof config.itemClass !== "undefined") {
      for (const item of tnsContainer.children) {
        item.className = config.itemClass;
      }
    }
    Object.assign(config, {
      container: tnsContainer,
      onInit: function () {
        tnsContainer.classList.remove("row", "d-grid");
      },
    });

    return tns(config);
  },
  initHandleCollapse: function () {
    let btnCollapse = document.getElementsByClassName("js-btn-collapse");

    for (const btn of btnCollapse) {
      let id = btn.getAttribute("data-target");
      let collapseContainer = document.getElementById(id);
      AT.handleCollapse(btn, collapseContainer);
    }
  },
  handleCollapse: function (btnTrigger, collapseContainer) {
    let first = true,
      isComplete = false;

    btnTrigger.addEventListener("click", function () {
      if (first || isComplete) {
        first = false;
        isComplete = false;

        if (collapseContainer.classList.contains("is-open")) {
          let height = collapseContainer.offsetHeight;
          collapseContainer.style.height = `${height}px`;
          AT.debounce(function () {
            collapseContainer.style.height = "0px";
          }, 1)();
          AT.debounce(() => {
            collapseContainer.style.height = "";
            collapseContainer.classList.remove("is-open");
            this.classList.remove("is-open");
            isComplete = true;
          }, 200)();
        } else {
          collapseContainer.classList.add("is-open");
          collapseContainer.style.height = "0px";
          let height = [...collapseContainer.children].reduce(
            (accu, currentValue) => accu + currentValue.offsetHeight,
            0
          );
          collapseContainer.style.height = `${height}px`;
          AT.debounce(() => {
            collapseContainer.style.height = "";
            this.classList.add("is-open");
            isComplete = true;
          }, 200)();
        }
      }
    });
  },
  initAddToCart: function (form) {
    // let formAddToCart = !!form ? [form] : [...document.getElementsByClassName("js-form-add-to-cart")];

    let btnAddToCart = form.getElementsByClassName("btn-add-to-cart")[0];
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      btnAddToCart.classList.add("pending");
      fetch("/cart/add.js", {
        method: "post",
        headers: new Headers(),
        body: new FormData(form),
      })
        .then((res) => res.json())
        .then((dataProduct) => {
          fetch("/cart.js")
            .then((res) => res.json())
            .then((cart) => {
              AT.cart = cart;
              AT.dispatchEvent("cartChange", cart);
              btnAddToCart.classList.remove("pending");
              AT.dispatchEvent("cartNotify", dataProduct);
            });
        })
        .catch((err) => console.log(err.message));
    });
    // for (const form of formAddToCart) {
    // }
  },
  initProductCard: function (productCart) {
    let form = productCart.querySelector("form");
    AT.initAddToCart(form);
  },
  getCart: function () {
    fetch("/cart.js", {
      method: "get",
      headers: new Headers(),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.item_count !== 0) {
          AT.cart = res;
        }
      });
  },
  removeCartItem: function (key, callback) {
    fetch("/cart/change.js", { method: "post", body: new URLSearchParams({ id: key, quantity: 0 }) })
      .then((res) => res.json())
      .then((cart) => (AT.dispatchEvent("cartChange", cart), callback()));
  },
  initTabs: function () {
    let tabControls = document.getElementsByClassName("js-tab-control");

    for (const control of tabControls) {
      control.addEventListener("click", function (e) {
        if (this.classList.contains("active")) {
          return;
        }
        let parent = this.closest("[data-tabs-control]");
        for (const child of parent.children) {
          child.classList.remove("active");
        }

        let targetID = this.getAttribute("data-target");
        let tabContent = document.getElementById(targetID);

        let parentTabsContent = tabContent.closest("[data-tabs-content]");

        for (const child of parentTabsContent.children) {
          child.classList.remove("active");
        }

        tabContent.classList.add("active");
        this.parentElement.classList.add("active");
      });
    }
  },
  initModal: function () {
    // add event modal close btn
    let closeBtn = document.getElementsByClassName("js-modal-close");
    for (const button of closeBtn) {
      let modal = button.closest(".modal");
      button.addEventListener("click", function () {
        modal.classList.remove("is-open");
      });
    }

    //init modal cart notify
    let cartNotify = document.getElementById("modal_cart_notify");
    AT.registerEvents("cartNotify", cartNotify);

    cartNotify.addEventListener("cartNotify", function ({ detail }) {
      let image = this.querySelector(".js-image");
      let qty = this.querySelector(".js-qty");
      let name = this.querySelector(".js-name");
      let totalMoney = this.querySelector(".js-item-total-money");
      let cartNumber = this.querySelector(".js-cart-number");
      let cartTotalMoney = this.querySelector(".js-cart-total-money");
      image.style.opacity = 0;
      image.src = getSizedImageUrl(detail.featured_image.url, "120x");
      image.alt = detail.title;
      image.onload = function () {
        this.style.opacity = 1;
      };
      qty.innerHTML = detail.quantity;
      name.innerHTML =
        detail.product_title +
        `<span class="option">${detail.options_with_values
          .map(function (item) {
            return item.value;
          })
          .join("/")}</span>`;
      cartNumber.innerHTML =
        AT.cart.item_count > 1
          ? theme.string.cartNumbers.replace("{{count}}", AT.cart.item_count)
          : theme.string.cartNumber.replace("{{count}}", AT.cart.item_count);

      totalMoney.innerHTML = AT.currency.formatMoney(detail.final_line_price, theme.currency.moneyFormat);
      cartTotalMoney.innerHTML = AT.currency.formatMoney(AT.cart.total_price, theme.currency.formatMoney);
      this.classList.add("is-open");
    });

    //init modal newsletter

    function setCookie(key, value, expiry) {
      var expires = new Date();
      expires.setTime(expires.getTime() + expiry * 24 * 60 * 60 * 1000);
      document.cookie = key + "=" + value + ";expires=" + expires.toUTCString();
    }

    function getCookie(key) {
      var keyValue = document.cookie.match("(^|;) ?" + key + "=([^;]*)(;|$)");
      return keyValue ? keyValue[2] : null;
    }

    function eraseCookie(key) {
      var keyValue = getCookie(key);
      setCookie(key, keyValue, "-1");
    }

    let newsletter = document.getElementById("modal_newsletter");
    !!newsletter &&
      !getCookie("myCookie") &&
      AT.debounce(function () {
        newsletter.classList.add("is-open");
        setCookie("myCookie", true, 3);
      }, 5000)();

    if (getCookie("removeNewsletter")) {
      newsletter.remove();
    }
  },
  initRecentlyView: function () {
    let recentlyView = JSON.parse(localStorage.getItem("recentlyView")) || [];

    !recentlyView.includes(theme.productHandle) && recentlyView.unshift(theme.productHandle);
    recentlyView.length = 10;

    localStorage.setItem("recentlyView", JSON.stringify(recentlyView));
  },
  initToggleSidebar: function () {
    let openSbBtn = [...document.getElementsByClassName("js-drawer-open")];
    let closeSbBtn = [...document.getElementsByClassName("js-drawer-close")];

    openSbBtn.forEach(function (button) {
      let targetID = button.getAttribute("data-target");
      let target = document.getElementById(targetID);
      button.addEventListener("click", function () {
        target.classList.add("is-open");
      });
    });

    closeSbBtn.forEach(function (button) {
      let targetID = button.getAttribute("data-target");
      let target = document.getElementById(targetID);
      button.addEventListener("click", function () {
        target.classList.remove("is-open");
      });
    });
  },
};

window.AT = Object.assign(window.AT | {}, AT);

export default AT;
