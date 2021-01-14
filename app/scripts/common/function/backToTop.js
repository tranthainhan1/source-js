export let BackToTop = function () {
  let btnToTop = document.getElementById("back-to-top");

  !!btnToTop &&
    btnToTop.addEventListener("click", function (e) {
      window.scroll({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    });
  window.addEventListener("scroll", function () {
    if (window.pageYOffset > window.innerHeight) {
      btnToTop.classList.add("show");
    } else {
      btnToTop.classList.remove("show");
    }
  });
};
