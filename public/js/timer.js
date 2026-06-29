// 26 Tech Solution — Download Timer
(function () {
  const SECONDS = parseInt(document.getElementById('timer-seconds')?.value || '10', 10);
  const numEl   = document.getElementById('timer-num');
  const circle  = document.getElementById('timer-circle');
  const btn     = document.getElementById('dl-go-btn');
  const FULL    = 283; // 2 * PI * r (r=45)

  let remaining = SECONDS;

  function tick() {
    remaining--;
    if (numEl) numEl.textContent = remaining;
    if (circle) {
      const offset = FULL - (FULL * (SECONDS - remaining) / SECONDS);
      circle.style.strokeDashoffset = offset;
    }
    if (remaining <= 0) {
      clearInterval(timer);
      if (btn) btn.classList.add('show');
    }
  }

  const timer = setInterval(tick, 1000);
})();
