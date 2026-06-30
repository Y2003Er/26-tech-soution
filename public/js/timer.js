// 26 Tech Solution — Real Download Link Generator
(function () {
  const panel = document.getElementById('dlPanel');
  if (!panel) return; // si ukurasa wa download

  const slug = panel.dataset.slug;

  const startWrap      = document.getElementById('dlStart');
  const startBtn       = document.getElementById('dlStartBtn');
  const generatingWrap = document.getElementById('dlGenerating');
  const progressFill   = document.getElementById('dlProgressFill');
  const countdownText  = document.getElementById('dlCountdownText');
  const readyWrap       = document.getElementById('dlReady');
  const finalBtn        = document.getElementById('dlFinalBtn');
  const errorWrap        = document.getElementById('dlError');
  const retryBtn          = document.getElementById('dlRetryBtn');

  function show(el) { if (el) el.hidden = false; }
  function hide(el) { if (el) el.hidden = true; }

  function resetUI() {
    hide(generatingWrap); hide(readyWrap); hide(errorWrap); show(startWrap);
  }

  function runProgress(seconds, onDone) {
    let elapsed = 0;
    countdownText.textContent = seconds;
    progressFill.style.width = '0%';
    const interval = setInterval(function () {
      elapsed += 1;
      const remaining = Math.max(seconds - elapsed, 0);
      countdownText.textContent = remaining > 0 ? remaining : 'Tayari';
      progressFill.style.width = Math.min((elapsed / seconds) * 100, 100) + '%';
      if (elapsed >= seconds) {
        clearInterval(interval);
        onDone();
      }
    }, 1000);
  }

  async function generateLink() {
    hide(startWrap); hide(errorWrap); hide(readyWrap); show(generatingWrap);

    try {
      const res = await fetch('/download/' + encodeURIComponent(slug) + '/prepare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Imeshindikana kuzalisha link');
      }

      const waitSeconds = data.waitSeconds || 5;

      runProgress(waitSeconds, function () {
        hide(generatingWrap);
        show(readyWrap);
        finalBtn.href = data.downloadUrl;

        setTimeout(function () {
          const iframe = document.createElement('iframe');
          iframe.style.display = 'none';
          iframe.src = data.downloadUrl;
          document.body.appendChild(iframe);
        }, 2000);
      });

    } catch (err) {
      console.error('generateLink error:', err);
      hide(generatingWrap);
      show(errorWrap);
    }
  }

  if (startBtn) startBtn.addEventListener('click', generateLink);
  if (retryBtn) retryBtn.addEventListener('click', resetUI);
})();