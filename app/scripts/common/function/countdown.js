//dependence https://albert-gonzalez.github.io/easytimer.js/

export let Countdown = function () {
  let countdownContainers = document.getElementsByClassName("js-countdown");
  setInterval(function () {
    for (const countdown of countdownContainers) {
      let daysElm = countdown.getElementsByClassName("js-countdown-days")[0];
      let hoursElm = countdown.getElementsByClassName("js-countdown-hours")[0];
      let minutesElm = countdown.getElementsByClassName("js-countdown-minutes")[0];
      let secondsElm = countdown.getElementsByClassName("js-countdown-seconds")[0];
      let date = new Date(countdown.getAttribute("data-date")).getTime() - new Date().getTime();
      let timer = new easytimer.Timer();

      timer.start({ countdown: true, startValues: { seconds: date / 1000 } });

      timer.addEventListener("secondsUpdated", function (e) {
        let days = timer.getTimeValues().days;
        let hours = timer.getTimeValues().hours;
        let minutes = timer.getTimeValues().minutes;
        let seconds = timer.getTimeValues().seconds;

        daysElm.innerHTML = days > 9 ? days : `0${days}`;
        hoursElm.innerHTML = hours > 9 ? hours : `0${hours}`;
        minutesElm.innerHTML = minutes > 9 ? minutes : `0${minutes}`;
        secondsElm.innerHTML = seconds > 9 ? seconds : `0${seconds}`;
      });
      countdown.classList.remove("js-countdown");
      countdown.classList.add("js-countdown-loaded");
    }
  }, 500);
};
