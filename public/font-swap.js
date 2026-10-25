// Turns the preloaded Google Fonts stylesheet into a real (non-render-blocking) stylesheet.
// It lives in its own file because the Content-Security-Policy (public/_headers) allows scripts from this site only:
// an inline onload="" on the <link> is blocked, which used to stop every web font from loading.
(function () {
  var link = document.getElementById('font-css');
  if (link) link.rel = 'stylesheet';
})();
