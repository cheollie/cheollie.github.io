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
  cursor.innerHTML = '<svg viewBox="0 0 250 220" width="42" height="39" style="overflow:visible" aria-hidden="true"><g class="goose-pose goose-side"><circle cx="112" cy="157" r="73" fill="#8d9390" opacity=".32"/><ellipse cx="103" cy="169" rx="13" ry="9" transform="rotate(-18 103 169)" fill="#efa91e"/><ellipse cx="129" cy="161" rx="13" ry="9" transform="rotate(-18 129 161)" fill="#efa91e"/><path d="M27 111C21 85 36 57 62 53c17-3 33 4 49 9l35 11-1-24c0-21 13-36 30-36 18 0 33 13 36 30l5 23-16 20-8 40c-5 29-28 46-56 42l-65-13c-25-5-38-19-44-44Z" fill="#fff" stroke="#858585" stroke-width="6" stroke-linejoin="round"/><path d="M187 50c12-5 30-2 42 5 11 7 16 17 12 27-4 10-17 13-30 10l-27-8c-13-4-16-24-6-30Z" fill="#ffad08"/><circle cx="178" cy="44" r="6" fill="#111"/><circle cx="192" cy="30" r="6" fill="#111"/></g><g class="goose-pose goose-down"><circle cx="125" cy="157" r="73" fill="#8d9390" opacity=".32"/><ellipse cx="105" cy="176" rx="12" ry="8" fill="#efa91e"/><ellipse cx="145" cy="176" rx="12" ry="8" fill="#efa91e"/><path d="M125 28 110 43C76 45 62 75 66 109c2 25 12 45 28 55l3 15c3 21 53 21 56 0l3-15c16-10 26-30 28-55 4-34-10-64-44-66Z" fill="#fff" stroke="#858585" stroke-width="6" stroke-linejoin="round"/><path d="M85 86c-5 22 0 44 13 52M165 86c5 22 0 44-13 52" fill="none" stroke="#dedede" stroke-width="4" stroke-linecap="round"/><circle cx="108" cy="156" r="6" fill="#111"/><circle cx="142" cy="156" r="6" fill="#111"/><ellipse cx="125" cy="178" rx="24" ry="14" fill="#ffad08"/></g><g class="goose-pose goose-up"><circle cx="125" cy="157" r="73" fill="#8d9390" opacity=".32"/><ellipse cx="105" cy="176" rx="12" ry="8" fill="#efa91e"/><ellipse cx="145" cy="176" rx="12" ry="8" fill="#efa91e"/><ellipse cx="125" cy="30" rx="16" ry="9" fill="#ffad08"/><path d="M101 66c-7-11-9-23-3-34 10-19 44-19 54 0 6 11 4 23-3 34 28 11 39 39 34 67-4 29-24 48-43 51l-15 14-15-14c-19-3-39-22-43-51-5-28 6-56 34-67Z" fill="#fff" stroke="#858585" stroke-width="6" stroke-linejoin="round"/><path d="M85 94c-4 23 2 48 21 59M165 94c4 23-2 48-21 59M112 180l13-11 13 11" fill="none" stroke="#dedede" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></g></svg>';
  cursor.dataset.pose = 'side';
  document.body.append(cursor);
  document.documentElement.classList.add('goose-cursor-active');

  const gooseSvg = cursor.querySelector('svg');
  const footPoint = gooseSvg.createSVGPoint();
  footPoint.x = 116;
  footPoint.y = 165;
  let printDistance = 0;
  let step = 0;
  document.addEventListener('mousemove', event => {
    cursor.style.left = event.clientX + 'px';
    cursor.style.top = event.clientY + 'px';
    const dx = event.clientX - (cursor._x ?? event.clientX);
    const dy = event.clientY - (cursor._y ?? event.clientY);
    let pose = cursor._pose ?? 'right';
    if (Math.hypot(dx, dy) > 0.5) {
      if (Math.abs(dy) > Math.abs(dx) * 1.3) pose = dy < 0 ? 'up' : 'down';
      else if (Math.abs(dx) > Math.abs(dy) * 1.15) pose = dx < 0 ? 'left' : 'right';
    }
    const flipped = cursor._pose !== undefined && cursor._pose !== pose;
    cursor._pose = pose;
    const vertical = pose === 'up' || pose === 'down';
    const direction = pose === 'left' ? -1 : 1;
    cursor.dataset.pose = vertical ? pose : 'side';
    const tilt = vertical ? 0 : Math.max(-10, Math.min(10, dy * 0.25));
    const offsetX = vertical ? -21 : (direction < 0 ? 12 : -54);
    const offsetY = pose === 'down' ? -51 : 12;
    cursor.style.transform = `translate(${offsetX}px, ${offsetY}px) scaleX(${direction}) rotate(${tilt}deg)`;
    footPoint.x = vertical ? 125 : 116;
    footPoint.y = vertical ? 176 : 165;
    const feet = footPoint.matrixTransform(gooseSvg.getScreenCTM());
    if (cursor._footX !== undefined && !flipped) {
      const footDx = feet.x - cursor._footX;
      const footDy = feet.y - cursor._footY;
      const distance = Math.hypot(footDx, footDy);
      if (distance > 0 && distance < 240) {
        const ux = footDx / distance;
        const uy = footDy / distance;
        const angle = Math.atan2(footDy, footDx) * 180 / Math.PI + 90;
        for (let along = 18 - printDistance; along <= distance; along += 18) {
          const side = step++ % 2 ? 4 : -4;
          const print = document.createElement('i');
          print.className = 'goose-footprint';
          print.setAttribute('aria-hidden', 'true');
          print.style.left = (cursor._footX + ux * along - uy * side) + 'px';
          print.style.top = (cursor._footY + uy * along + ux * side) + 'px';
          print.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
          document.body.append(print);
          setTimeout(() => print.remove(), 1250);
        }
        printDistance = (printDistance + distance) % 18;
      } else if (distance >= 240) {
        printDistance = 0;
      }
    }
    if (flipped) printDistance = 0;
    cursor._footX = feet.x;
    cursor._footY = feet.y;
    cursor._x = event.clientX;
    cursor._y = event.clientY;
  });
  document.addEventListener('mouseleave', () => {
    document.documentElement.classList.remove('goose-cursor-active');
    cursor._footX = undefined;
    cursor._footY = undefined;
    cursor._x = undefined;
    cursor._y = undefined;
    printDistance = 0;
  });
  document.addEventListener('mouseenter', () => document.documentElement.classList.add('goose-cursor-active'));
})();
