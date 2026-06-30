document.addEventListener('DOMContentLoaded', function () {

  // ── Scroll laini kwenda kwenye anchor (#results, #latest n.k) hata baada ya full page reload ──
  if (location.hash) {
    var scrollTarget = document.querySelector(location.hash);
    if (scrollTarget) {
      setTimeout(function () {
        scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    }
  }

  var searchToggle = document.querySelector('[data-search-toggle]');
  var searchOverlay = document.querySelector('[data-search-overlay]');
  var searchClose = document.querySelector('[data-search-close]');

  if (searchToggle && searchOverlay) {
    searchToggle.addEventListener('click', function () {
      searchOverlay.classList.add('is-open');
      var input = searchOverlay.querySelector('input[type="search"]');
      if (input) setTimeout(function () { input.focus(); }, 150);
    });
  }
  if (searchClose && searchOverlay) {
    searchClose.addEventListener('click', function () {
      searchOverlay.classList.remove('is-open');
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && searchOverlay) searchOverlay.classList.remove('is-open');
  });

  var navToggle = document.querySelector('[data-nav-toggle]');
  var navLinks = document.querySelector('[data-nav-links]');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      navLinks.classList.toggle('is-open');
    });
  }

  document.addEventListener('click', function (e) {
    var copy = e.target.closest('[data-copy-link]');
    if (copy) {
      e.preventDefault();
      navigator.clipboard && navigator.clipboard.writeText(location.href);
      copy.textContent = 'Copied';
      setTimeout(function () { copy.textContent = copy.dataset.originalText || 'Copy Link'; }, 1400);
    }

    var shareBtn = e.target.closest('[data-share-app]');
    if (shareBtn) {
      e.preventDefault();
      var shareData = {
        title: shareBtn.getAttribute('data-share-title') || document.title,
        text: shareBtn.getAttribute('data-share-text') || '',
        url: location.href
      };
      if (navigator.share) {
        navigator.share(shareData).catch(function () {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(location.href);
        var original = shareBtn.textContent;
        shareBtn.textContent = 'Link Copied';
        setTimeout(function () { shareBtn.textContent = original; }, 1400);
      }
    }
  });

  document.querySelectorAll('[data-copy-link]').forEach(function (btn) {
    btn.dataset.originalText = btn.textContent;
  });

  var tableSearch = document.querySelector('[data-table-search]');
  if (tableSearch) {
    tableSearch.addEventListener('input', function () {
      var q = tableSearch.value.toLowerCase();
      document.querySelectorAll('.admin-table tbody tr').forEach(function (row) {
        row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
    });
  }

  var source = document.querySelector('[data-slug-source]');
  var preview = document.querySelector('[data-slug-preview]');
  if (source && preview) {
    var sync = function () {
      preview.value = source.value.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '').trim()
        .replace(/\s+/g, '-').replace(/-+/g, '-');
    };
    source.addEventListener('input', sync);
    if (!preview.value) sync();
  }

  document.querySelectorAll('[data-instant-search]').forEach(function (input) {
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') input.blur();
    });
  });

  var newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      var emailInput = document.getElementById('newsletterEmail');
      var btn = document.getElementById('newsletterBtn');
      var msg = document.getElementById('newsletterMsg');
      var email = emailInput.value.trim();

      if (!email) return;

      btn.disabled = true;
      var originalText = btn.textContent;
      btn.textContent = 'Inatuma...';
      msg.hidden = true;

      try {
        var res = await fetch('/newsletter/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email }),
        });
        var data = await res.json();

        msg.textContent = data.message || (data.success ? 'Umejisajili!' : 'Hitilafu imetokea.');
        msg.classList.toggle('is-error', !data.success);
        msg.hidden = false;

        if (data.success) emailInput.value = '';
      } catch (err) {
        msg.textContent = 'Imeshindikana kuunganisha na seva, jaribu tena.';
        msg.classList.add('is-error');
        msg.hidden = false;
      } finally {
        btn.disabled = false;
        btn.textContent = originalText;
      }
    });
  }
});