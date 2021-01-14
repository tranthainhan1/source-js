class Search {
  constructor(container) {
    this.input = container.querySelector("input[name='q']");
    this.container = container;
    this.results = container.querySelector("js-results");
    this.init();
  }
  init() {
    this.input.addEvent("keyup");
  }
}
