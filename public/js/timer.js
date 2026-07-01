// 26 Tech Solution — Real Download Link Generator
(function () {
  const panel = document.getElementById('dlPanel');
  if (!panel) return; // si ukurasa wa download

  const slug = panel.dataset.slug;

  const startWrap       = document.getElementById('dlStart');
  const startBtn         = document.getElementById('dlStartBtn');
  const generatingWrap = document.getElementById('dlGenerating');
  const progressFill   = document.getElementById('dlProgressFill');
  const readyWrap        = document.getElementById('dlReady');
  const finalBtn          = document.getElementById('dlFinalBtn');
  const errorWrap          = document.getElementById('dlError');
  const retryBtn            = document.getElementById('dlRetryBtn');

  function show(el) { if (el) el.hidden = false; }
  function hide(el) { if (el) el.hidden = true; }

  function runProgress(seconds, onDone) {
    let elapsed = 0;
    progressFill.style.width = '0%';
    const interval = setInterval(function () {
      elapsed += 1;
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
        // AUTO-DOWNLOAD IMEZIMWA — mtumiaji lazima abonyeze "Download" mwenyewe
      });

    } catch (err) {
      console.error('generateLink error:', err);
      hide(generatingWrap);
      show(errorWrap);
    }
  }

  if (startBtn) startBtn.addEventListener('click', generateLink);
  if (retryBtn) retryBtn.addEventListener('click', generateLink);
})();