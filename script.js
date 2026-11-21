(function () {
  const musicButton = document.getElementById('headphone-toggle');
  const musicBubble = document.getElementById('song-bubble');
  const timsButton = document.getElementById('tims-toggle');
  const timsTip = document.getElementById('tims-tooltip');

  function wirePopover(button, tip, scrollIntoView = false) {
    if (!button || !tip) return;
    button.addEventListener('click', () => {
      const open = tip.hidden;
      tip.hidden = !open;
      button.setAttribute('aria-expanded', String(open));
      if (open && scrollIntoView) {
        requestAnimationFrame(() => tip.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
      }
    });
    document.addEventListener('click', event => {
      if (!tip.hidden && !tip.contains(event.target) && !button.contains(event.target)) {
        tip.hidden = true;
        button.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !tip.hidden) {
        tip.hidden = true;
        button.setAttribute('aria-expanded', 'false');
        button.focus();
      }
    });
  }

  wirePopover(musicButton, musicBubble, true);
  wirePopover(timsButton, timsTip);

  const finePointer = matchMedia('(pointer:fine)').matches;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const landingPage = document.body.classList.contains('home-page');
  if (!finePointer || reducedMotion || landingPage) return;

  const cursor = document.createElement('div');
  cursor.id = 'goose-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  cursor.innerHTML = '<svg viewBox="0 0 250 220" width="30" height="27" aria-hidden="true"><ellipse cx="126" cy="171" rx="92" ry="49" fill="#aaa9a8"/><path d="M55 63c17-20 54-17 107-2-4-17-2-37 10-49 16-15 37-9 47 8 5 9 5 20 0 29l19 16c8 7 7 19-4 25-8 4-21 4-31-1-4 37-18 64-46 72-28 8-66-3-97-11C27 139 9 121 11 97c1-15 17-29 44-34Z" fill="#fff" stroke="#aaa" stroke-width="5" stroke-linejoin="round"/><path d="M194 40c17-10 38-7 50 4 12 11 5 26-10 33-16 7-38 3-48-8-9-10-5-23 8-29Z" fill="#ffad08"/><circle cx="181" cy="30" r="7" fill="#111"/><circle cx="194" cy="30" r="7" fill="#111"/><path d="M83 158c-3 15-10 25-20 34-10 9-1 21 13 20 19-1 31-19 35-42Zm34 4c1 14 7 25 17 34 10 9 1 21-13 20-20-1-31-19-34-42Z" fill="#efa91e"/></svg>';
  document.body.append(cursor);
  document.documentElement.classList.add('goose-cursor-active');

  let lastPrint = 0;
  let step = 0;
  document.addEventListener('mousemove', event => {
    cursor.style.left = event.clientX + 'px';
    cursor.style.top = event.clientY + 'px';
    const dx = event.clientX - (cursor._x ?? event.clientX);
    const dy = event.clientY - (cursor._y ?? event.clientY);
    const direction = dx < -0.5 ? -1 : 1;
    const tilt = Math.max(-10, Math.min(10, dy * 0.25));
    cursor.style.transform = `translate(-14px, -16px) scaleX(${direction}) rotate(${tilt}deg)`;
    cursor._x = event.clientX;
    cursor._y = event.clientY;
    if (Date.now() - lastPrint > 110) {
      const print = document.createElement('i');
      print.className = 'goose-footprint';
      print.setAttribute('aria-hidden', 'true');
      print.style.left = (event.clientX + (step % 2 ? 5 : -5)) + 'px';
      print.style.top = (event.clientY + 7) + 'px';
      print.style.transform = `scaleX(${direction}) rotate(${tilt}deg) rotate(${step % 2 ? 15 : -15}deg)`;
      document.body.append(print);
      setTimeout(() => print.remove(), 1250);
      lastPrint = Date.now();
      step++;
    }
  });
  document.addEventListener('mouseleave', () => document.documentElement.classList.remove('goose-cursor-active'));
  document.addEventListener('mouseenter', () => document.documentElement.classList.add('goose-cursor-active'));
})();
