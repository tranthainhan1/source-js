export let Tabs = function () {
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
};
