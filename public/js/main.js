document.addEventListener('DOMContentLoaded',function(){
var searchToggle=document.querySelector('[data-search-toggle]');
var searchOverlay=document.querySelector('[data-search-overlay]');
var searchClose=document.querySelector('[data-search-close]');
if(searchToggle&&searchOverlay){
  searchToggle.addEventListener('click',function(){
    searchOverlay.classList.add('is-open');
    var input=searchOverlay.querySelector('input[type="search"]');
    if(input)setTimeout(function(){input.focus()},150);
  });
}
if(searchClose&&searchOverlay){
  searchClose.addEventListener('click',function(){
    searchOverlay.classList.remove('is-open');
  });
}
document.addEventListener('keydown',function(e){
  if(e.key==='Escape'&&searchOverlay)searchOverlay.classList.remove('is-open');
});
var navToggle=document.querySelector('[data-nav-toggle]');var navLinks=document.querySelector('[data-nav-links]');if(navToggle&&navLinks){navToggle.addEventListener('click',function(){navLinks.classList.toggle('is-open')})}var modal=document.querySelector('[data-download-modal]');var close=document.querySelector('[data-modal-close]');var countdown=document.querySelector('[data-countdown]');var manual=document.querySelector('[data-manual-link]');var title=document.querySelector('[data-modal-title]');function startDownload(url,name){if(!modal||!countdown||!manual)return true;modal.classList.add('is-open');modal.setAttribute('aria-hidden','false');manual.href=url;if(title)title.textContent='Preparing '+(name||'Download')+'...';var n=3;countdown.textContent=n;var timer=setInterval(function(){n-=1;countdown.textContent=n>0?n:'Ready';if(n<=0){clearInterval(timer);var iframe=document.createElement('iframe');iframe.style.display='none';iframe.src=url;document.body.appendChild(iframe);manual.textContent='Download Manually';}},1000);return false}document.addEventListener('click',function(e){var trigger=e.target.closest('[data-download-url]');if(trigger){e.preventDefault();startDownload(trigger.getAttribute('data-download-url'),trigger.getAttribute('data-download-name'))}var copy=e.target.closest('[data-copy-link]');if(copy){e.preventDefault();navigator.clipboard&&navigator.clipboard.writeText(location.href);copy.textContent='Copied';setTimeout(function(){copy.textContent=copy.dataset.originalText||'Copy Link'},1400)}});if(close&&modal){close.addEventListener('click',function(){modal.classList.remove('is-open');modal.setAttribute('aria-hidden','true')})}document.querySelectorAll('[data-copy-link]').forEach(function(btn){btn.dataset.originalText=btn.textContent});var tableSearch=document.querySelector('[data-table-search]');if(tableSearch){tableSearch.addEventListener('input',function(){var q=tableSearch.value.toLowerCase();document.querySelectorAll('.admin-table tbody tr').forEach(function(row){row.style.display=row.textContent.toLowerCase().includes(q)?'':'none'})})}var source=document.querySelector('[data-slug-source]');var preview=document.querySelector('[data-slug-preview]');if(source&&preview){var sync=function(){preview.value=source.value.toLowerCase().replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-').replace(/-+/g,'-')};source.addEventListener('input',sync);if(!preview.value)sync()}document.querySelectorAll('[data-instant-search]').forEach(function(input){input.addEventListener('keydown',function(e){if(e.key==='Escape')input.blur()})})});