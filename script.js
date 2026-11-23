(function () {
  const cleanRoutes={'/index.html':'/','/about.html':'/about','/projects.html':'/projects/','/blog.html':'/blog'};
  if(cleanRoutes[location.pathname])history.replaceState(history.state,'',cleanRoutes[location.pathname]+location.search+location.hash);

  function glowBrand(event) {
    const link = event.target.closest?.('.navbar-title-text');
    const flower = link?.querySelector('.brand-sunflower');
    if (!flower) return;
    flower.classList.remove('sunflower-glow');
    void flower.offsetWidth;
    flower.classList.add('sunflower-glow');
    setTimeout(() => flower.classList.remove('sunflower-glow'), 750);
  }
  document.addEventListener('pointerdown', glowBrand);
  document.addEventListener('keydown', event => {if(event.key==='Enter' || event.key===' ')glowBrand(event);});
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

  if (musicButton && musicBubble) {
    let timer, pinned = false;
    // Position outside the zoomed photo container so viewport bounds stay exact.
    document.body.append(musicBubble);
    function positionSong() {
      const anchor = musicButton.getBoundingClientRect();
      const navbarBottom = document.querySelector('#navbar')?.getBoundingClientRect().bottom || 0;
      const topBound = Math.max(12, navbarBottom + 10);
      musicBubble.style.maxHeight = Math.max(80, innerHeight - topBound - 12) + 'px';
      const rect = musicBubble.getBoundingClientRect();
      musicBubble.style.left = Math.max(16, Math.min(anchor.right - rect.width, innerWidth - rect.width - 16)) + 'px';
      musicBubble.style.top = Math.max(topBound, Math.min(anchor.top - rect.height - 12, innerHeight - rect.height - 12)) + 'px';
    }
    function showSong() {clearTimeout(timer);musicBubble.hidden=false;musicButton.setAttribute('aria-expanded','true');positionSong();}
    function hideSong() {clearTimeout(timer);musicBubble.hidden=true;musicButton.setAttribute('aria-expanded','false');}
    function scheduleHide() {clearTimeout(timer);timer=setTimeout(()=>{if(!pinned && !musicButton.matches(':hover') && !musicBubble.matches(':hover') && document.activeElement!==musicButton && !musicBubble.contains(document.activeElement))hideSong();},180);}
    musicButton.addEventListener('mouseenter',showSong);
    musicButton.addEventListener('focus',showSong);
    musicButton.addEventListener('mouseleave',scheduleHide);
    musicButton.addEventListener('blur',scheduleHide);
    musicBubble.addEventListener('mouseenter',()=>clearTimeout(timer));
    musicBubble.addEventListener('mouseleave',scheduleHide);
    musicBubble.addEventListener('focusout',scheduleHide);
    musicButton.addEventListener('click',()=>{pinned=!pinned;if(pinned)showSong();else hideSong();});
    document.addEventListener('click',e=>{if(!musicButton.contains(e.target) && !musicBubble.contains(e.target)){pinned=false;hideSong();}});
    document.addEventListener('keydown',e=>{if(e.key==='Escape' && !musicBubble.hidden){pinned=false;musicButton.focus();hideSong();}});
    addEventListener('resize',()=>{if(!musicBubble.hidden)positionSong();});
    addEventListener('scroll',()=>{if(!musicBubble.hidden)positionSong();},{passive:true,capture:true});
  }
  if (timsButton && timsTip) {
    let hideTimer;
    function showTimsFact() {
      clearTimeout(hideTimer);
      timsTip.hidden = false;
      timsButton.setAttribute('aria-expanded', 'true');
    }
    function hideTimsFact() {
      clearTimeout(hideTimer);
      timsTip.hidden = true;
      timsButton.setAttribute('aria-expanded', 'false');
    }
    function scheduleTimsHide() {
      hideTimer = setTimeout(() => {
        if (document.activeElement !== timsButton) hideTimsFact();
      }, 120);
    }
    timsButton.addEventListener('mouseenter', showTimsFact);
    timsButton.addEventListener('mouseleave', scheduleTimsHide);
    timsButton.addEventListener('focus', showTimsFact);
    timsButton.addEventListener('blur', scheduleTimsHide);
    timsTip.addEventListener('mouseenter', showTimsFact);
    timsTip.addEventListener('mouseleave', scheduleTimsHide);
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') hideTimsFact();
    });
  }

  const finePointer = matchMedia('(pointer:fine)').matches;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!finePointer || reducedMotion) return;

  const cursor = document.createElement('div');
  cursor.id = 'goose-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  cursor.innerHTML = '<svg viewBox="0 0 250 220" width="42" height="39" style="overflow:visible" aria-hidden="true"><g class="goose-pose goose-side"><circle cx="112" cy="157" r="73" fill="#8d9390" opacity=".32"/><ellipse cx="103" cy="169" rx="13" ry="9" transform="rotate(-18 103 169)" fill="#efa91e"/><ellipse cx="129" cy="161" rx="13" ry="9" transform="rotate(-18 129 161)" fill="#efa91e"/><path d="M27 111C21 85 36 57 62 53c17-3 33 4 49 9l35 11-1-24c0-21 13-36 30-36 18 0 33 13 36 30l5 23-16 20-8 40c-5 29-28 46-56 42l-65-13c-25-5-38-19-44-44Z" fill="#fff" stroke="#858585" stroke-width="6" stroke-linejoin="round"/><path d="M187 50c12-5 30-2 42 5 11 7 16 17 12 27-4 10-17 13-30 10l-27-8c-13-4-16-24-6-30Z" fill="#ffad08"/><circle cx="178" cy="44" r="6" fill="#111"/><circle cx="192" cy="30" r="6" fill="#111"/></g><g class="goose-pose goose-down"><circle cx="125" cy="157" r="73" fill="#8d9390" opacity=".32"/><ellipse cx="105" cy="176" rx="12" ry="8" fill="#efa91e"/><ellipse cx="145" cy="176" rx="12" ry="8" fill="#efa91e"/><path d="M125 28 110 43C76 45 62 75 66 109c2 25 12 45 28 55l3 15c3 21 53 21 56 0l3-15c16-10 26-30 28-55 4-34-10-64-44-66Z" fill="#fff" stroke="#858585" stroke-width="6" stroke-linejoin="round"/><path d="M85 86c-5 22 0 44 13 52M165 86c5 22 0 44-13 52" fill="none" stroke="#dedede" stroke-width="4" stroke-linecap="round"/><circle cx="108" cy="156" r="6" fill="#111"/><circle cx="142" cy="156" r="6" fill="#111"/><ellipse cx="125" cy="178" rx="24" ry="14" fill="#ffad08"/></g><g class="goose-pose goose-up"><circle cx="125" cy="157" r="73" fill="#8d9390" opacity=".32"/><ellipse cx="105" cy="176" rx="12" ry="8" fill="#efa91e"/><ellipse cx="145" cy="176" rx="12" ry="8" fill="#efa91e"/><ellipse cx="125" cy="30" rx="16" ry="9" fill="#ffad08"/><path d="M101 66c-7-11-9-23-3-34 10-19 44-19 54 0 6 11 4 23-3 34 28 11 39 39 34 67-4 29-24 48-43 51l-15 14-15-14c-19-3-39-22-43-51-5-28 6-56 34-67Z" fill="#fff" stroke="#858585" stroke-width="6" stroke-linejoin="round"/><path d="M85 94c-4 23 2 48 21 59M165 94c4 23-2 48-21 59M112 180l13-11 13 11" fill="none" stroke="#dedede" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></g></svg>';
  cursor.dataset.pose = 'side';
  document.body.append(cursor);

  const gooseSvg = cursor.querySelector('svg');
  const footPoint = gooseSvg.createSVGPoint();
  footPoint.x = 116;
  footPoint.y = 165;
  let printDistance = 0;
  let step = 0;
  // Follow a point behind the pointer, with a stable four-way heading.
  let pointerX;
  let pointerY;
  let x;
  let y;
  let directionX;
  let directionY;
  let pose = 'right';
  let trailX = -34;
  let trailY = 0;
  let frame = 0;
  let previousFrame = 0;
  const directionThreshold = 8;
  cursor.hidden = true;

  function follow(time) {
    const elapsed = previousFrame ? Math.min(time - previousFrame, 50) : 16;
    previousFrame = time;
    const targetX = pointerX + trailX;
    const targetY = pointerY + trailY;
    const ease = 1 - Math.exp(-elapsed / 55);
    x += (targetX - x) * ease;
    y += (targetY - y) * ease;
    cursor.style.left = x + 'px';
    cursor.style.top = y + 'px';
    cursor.style.transform = `translate(-21px, -19.5px) scaleX(${pose === 'left' ? -1 : 1})`;
    const feet = footPoint.matrixTransform(gooseSvg.getScreenCTM());
    if (cursor._footX !== undefined) {
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
    cursor._footX = feet.x;
    cursor._footY = feet.y;
    if (Math.hypot(targetX - x, targetY - y) > 0.1) {
      frame = requestAnimationFrame(follow);
    } else {
      frame = 0;
      previousFrame = 0;
    }
  }

  document.addEventListener('mousemove', event => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    if (directionX === undefined) {
      directionX = pointerX;
      directionY = pointerY;
      x = pointerX - 34;
      y = pointerY;
    }
    const dx = pointerX - directionX;
    const dy = pointerY - directionY;
    const distance = Math.hypot(dx, dy);
    if (distance >= directionThreshold) {
      // Position follows the full movement vector; only the artwork is quantized.
      trailX = -34 * dx / distance;
      trailY = -34 * dy / distance;
      const nextPose = Math.abs(dx) >= Math.abs(dy)
        ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down');
      if (nextPose !== pose) {
        cursor._footX = undefined;
        cursor._footY = undefined;
        printDistance = 0;
      }
      pose = nextPose;
      directionX = pointerX;
      directionY = pointerY;
    }
    const vertical = pose === 'up' || pose === 'down';
    cursor.dataset.pose = vertical ? pose : 'side';
    footPoint.x = vertical ? 125 : 116;
    footPoint.y = vertical ? 176 : 165;
    cursor.hidden = false;
    document.documentElement.classList.add('goose-cursor-active');
    if (!frame) frame = requestAnimationFrame(follow);
  });
  document.addEventListener('pointerdown', event => {
    if (event.pointerType === 'touch' || event.button !== 0 ||
        !document.documentElement.classList.contains('goose-cursor-active')) return;
    const bloom = document.createElement('div');
    bloom.className = 'cursor-bloom';
    bloom.setAttribute('aria-hidden', 'true');
    bloom.style.left = event.clientX + 'px';
    bloom.style.top = event.clientY + 'px';
    const petals = Array.from({length: 12}, (_, i) =>
      `<ellipse cx="20" cy="9" rx="3.8" ry="7.5" transform="rotate(${i * 30} 20 20)"/>`).join('');
    bloom.innerHTML = `<svg viewBox="0 0 40 40" aria-hidden="true"><g class="cursor-bloom-petals" fill="#f5bd32" stroke="#b57d19" stroke-width=".6">${petals}</g><circle cx="20" cy="20" r="5" fill="#63442d"/></svg>`;
    document.body.append(bloom);
    setTimeout(() => bloom.remove(), 750);
  });
  document.addEventListener('mouseleave', () => {
    document.documentElement.classList.remove('goose-cursor-active');
    cursor.hidden = true;
    directionX = undefined;
    directionY = undefined;
    cancelAnimationFrame(frame);
    frame = 0;
    previousFrame = 0;
    cursor._footX = undefined;
    cursor._footY = undefined;
    cursor._x = undefined;
    cursor._y = undefined;
    printDistance = 0;
  });
  window.addEventListener('blur', () => document.dispatchEvent(new MouseEvent('mouseleave')));
})();
