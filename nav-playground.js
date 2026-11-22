(() => {
  const frame = document.getElementById('preview');
  const height = document.getElementById('height');
  const tint = document.getElementById('tint');
  const navBackground = document.getElementById('nav-background');
  const navColor = document.getElementById('nav-color');
  const pageBackground = document.getElementById('page-background');
  const pageColor = document.getElementById('page-color');
  const position = document.getElementById('position');
  const descriptions = {
    slim: 'A shorter bar with the original underbar shadow. Try a solid background or the gradient.',
    side: 'A quiet index on the left, inspired by your first reference. No dividing wall.',
    bare: 'Name and links sit directly on the scene. No shadow, border, or separate background.',
    float: 'A centered floating bar. Compare quiet solid colors with the original gradient.',
    inline: 'Navigation follows your introduction, like a few next chapters to explore.'
  };
  const defaults = { slim: [56, 100], side: [64, 0], bare: [64, 0], float: [64, 88], inline: [48, 0] };
  let mode = 'bare';
  let original = false;
  let style;
  let inlineNav;
  let brand;
  let originalBrand;
  const nameChoice = document.getElementById('name-choice');

  function render() {
    if (!style) return;
    document.getElementById('height-value').value = `${height.value} px`;
    document.getElementById('tint-value').value = `${tint.value}%`;
    document.getElementById('description').textContent = original ? 'Your existing full-width navbar, for a quick before-and-after.' : descriptions[mode];
    document.getElementById('position-label').hidden = mode !== 'float' || original;
    document.getElementById('original').setAttribute('aria-pressed', String(original));
    document.getElementById('original').textContent = original ? 'back to experiment' : 'compare original';
    for (const button of document.querySelectorAll('[data-mode]')) button.setAttribute('aria-pressed', String(!original && button.dataset.mode === mode));
    height.disabled = tint.disabled = original;
    for (const control of [navBackground, navColor, pageBackground, pageColor]) control.disabled = original;
    document.getElementById('custom-nav-label').hidden = navBackground.value !== 'custom';
    document.getElementById('custom-page-label').hidden = pageBackground.value !== 'custom';
    inlineNav.hidden = original || mode !== 'inline';
    nameChoice.disabled = original;
    brand.hidden = !original && nameChoice.value === 'none';
    if (original || nameChoice.value === 'original') brand.innerHTML = originalBrand;
    else {
      const withFlower = nameChoice.value.endsWith('-flower');
      const label = nameChoice.value.startsWith('chelsea-w') ? 'chelsea w' : 'chelsea';
      brand.replaceChildren();
      if (withFlower) {
        const flower = brand.ownerDocument.createElement('span');
        flower.textContent = '🌻';
        flower.setAttribute('aria-hidden', 'true');
        flower.className = 'name-flower';
        brand.append(flower);
      }
      brand.append(brand.ownerDocument.createTextNode(label));
    }
    if (original) { style.textContent = ''; return; }
    const h = Number(height.value);
    const solid = {white:'#fffdfb', cream:'#fff6da', sage:'#edf1e8', custom:navColor.value};
    const hex = solid[navBackground.value] || solid.white;
    const rgb = [1,3,5].map(index => parseInt(hex.slice(index, index + 2), 16));
    const background = `rgba(${rgb.join(',')}, ${Number(tint.value) / 100})`;
    const gradient = `linear-gradient(270deg,rgba(255,255,255,${Number(tint.value)/100}) 0%,rgba(253,230,164,${Number(tint.value)/100}) 100%)`;
    const navFill = navBackground.value === 'gradient' ? gradient : background;
    const common = `
      .home-page .main{top:0;height:100dvh;width:100%}
      .home-page .home-content-vc{top:50%;transform:translateY(-50%)}
      .home-page .duck{min-height:0;min-width:0}
      .nav-preview #navbar #subnavbarleft[hidden]{display:none}
      .nav-preview #navbar:has(.navbar-title-text[hidden]){justify-content:flex-end}
      .nav-preview #navbar .navbar-title-text[hidden]{display:none}
      .nav-preview .navbar-title-text{display:inline-flex;align-items:center;gap:9px;font-weight:550}
      .nav-preview .name-flower{font-family:"Apple Color Emoji","Segoe UI Emoji",sans-serif;font-size:24px;line-height:1;color:currentColor}
      .nav-preview #navbar{box-sizing:border-box;position:fixed;z-index:30;display:flex;align-items:center;justify-content:space-between;height:${h}px;padding:0 34px;background:${navFill};box-shadow:none;border:0;transition:none}
      .nav-preview #subnavbarleft,.nav-preview #subnavbarright{display:flex;align-items:center;padding:0}
      .nav-preview #subnavbarright{gap:28px}
      .nav-preview .navbar-title-text{font-size:22px;white-space:nowrap}
      .nav-preview .navbar-title-text .semibold{font-size:22px!important}
      .nav-preview .navbar-subtitle-text{font-size:16px;padding:12px 0;margin:0}
      .nav-preview #navbar a:focus-visible{outline:2px solid #837756;outline-offset:5px}
      #intro-navigation{display:flex;gap:24px;flex-wrap:wrap;margin-top:24px;pointer-events:auto}
      #intro-navigation[hidden]{display:none}
      #intro-navigation a{font-size:16px;padding:10px 0;text-decoration:underline;text-decoration-color:#c5b982;text-underline-offset:6px}
      #intro-navigation a:hover{color:#82712c}
      #intro-navigation a:focus-visible{outline:2px solid #718344;outline-offset:5px}
      @media(max-width:800px){#intro-navigation{gap:20px}}
      @media(max-width:800px){.home-page .home-content-vc{top:120px;transform:none}.nav-preview #navbar{padding:0 22px}.nav-preview #subnavbarright{gap:18px}.nav-preview .navbar-title-text{font-size:19px}.nav-preview .navbar-subtitle-text{font-size:14px}}
      @media(max-width:420px){.nav-preview #navbar{padding:0 16px}.nav-preview #subnavbarright{gap:14px}.nav-preview .navbar-title-text .semibold{display:none}}
    `;
    const variants = {
      slim: `
        .nav-preview #navbar{left:0;top:0;width:100%;background:${navFill};box-shadow:0 0 10px rgba(0,0,0,.3)}
        .home-page .main{top:${h}px;height:calc(100dvh - ${h}px)}
      `,
      bare: `.nav-preview #navbar{left:0;top:16px;width:100%}`,
      inline: `
        .nav-preview #navbar{left:0;top:16px;width:100%;background:transparent}
        .nav-preview #navbar #subnavbarright{display:none}
      `,
      side: `
        .nav-preview #navbar{top:42px;left:38px;bottom:38px;width:155px;height:auto;padding:14px;flex-direction:column;align-items:flex-start;justify-content:flex-start;border-radius:12px}
        .nav-preview #subnavbarright{flex-direction:column;align-items:flex-start;gap:10px;margin-top:58px}
        .home-page .home-content-vc{left:220px;padding-left:0;max-width:calc(100% - 250px)}
        @media(max-width:800px){.nav-preview #navbar{left:12px;top:24px;bottom:auto;width:110px;padding:8px}.nav-preview #subnavbarright{margin-top:24px;gap:6px}.home-page .home-content-vc{left:140px;top:120px;transform:none;width:calc(100% - 150px);max-width:none;padding:0 10px}.home-page .home-title{font-size:22px}.home-page .landing-summary{font-size:13px}}
      `,
      float: `
        .nav-preview #navbar{left:50%;transform:translateX(-50%);width:min(520px,calc(100% - 32px));background:${navFill};top:${position.value === 'top' ? '24px' : 'auto'};bottom:${position.value === 'bottom' ? '24px' : 'auto'};border-radius:18px;padding:0 24px;border:1px solid rgba(145,126,61,.13);box-shadow:0 5px 20px rgba(76,62,14,.08)}
        @media(max-width:800px){.nav-preview #navbar{padding:0 20px}.nav-preview #subnavbarright{gap:16px}}
      `
    };
    const scrollLayout = `
      .scroll-page.nav-preview{padding-top:${mode === 'float' ? h + 48 : mode === 'side' ? 24 : h + 16}px;box-sizing:border-box}
      ${mode === 'side' ? '.scroll-page.nav-preview{padding-left:190px}@media(max-width:800px){.scroll-page.nav-preview{padding-left:130px}}' : ''}
      .scroll-page.nav-preview #intro-navigation{margin-bottom:24px}
      .nav-preview #navbar .navbar-subtitle-text[aria-current=page]{text-decoration:underline;text-decoration-color:#9a8544;text-underline-offset:7px}
    `;
    const pageFills = {
      white:'#ffffff', cream:'#fffdf5', sage:'#f5f8f1', lavender:'#f7f5fb', custom:pageColor.value,
      wash:'radial-gradient(ellipse at 6% 0%, #faf0d7 0%, transparent 55%), radial-gradient(ellipse at 100% 85%, #edf2e8 0%, transparent 55%), #fffefa'
    };
    const pageFill = pageFills[pageBackground.value];
    const pageStyle = pageFill ? `body.nav-preview{background:${pageFill};background-attachment:fixed}` : '';
    style.textContent = common + variants[mode] + scrollLayout + pageStyle;
    const url = new URL(location.href);
    url.searchParams.set('nav', mode);
    url.searchParams.set('name', nameChoice.value);
    url.searchParams.set('navbg', navBackground.value);
    url.searchParams.set('pagebg', pageBackground.value);
    url.searchParams.set('navcolor', navColor.value);
    url.searchParams.set('pagecolor', pageColor.value);
    url.searchParams.set('page', document.getElementById('page-choice').value);
    history.replaceState(null, '', url);
  }
  for (const button of document.querySelectorAll('[data-mode]')) {
    button.addEventListener('click', () => {
      mode = button.dataset.mode;
      original = false;
      [height.value, tint.value] = defaults[mode];
      render();
    });
  }
  height.addEventListener('input', render);
  tint.addEventListener('input', render);
  position.addEventListener('change', render);
  for (const control of [navBackground, navColor, pageBackground, pageColor]) control.addEventListener('input', render);
  nameChoice.addEventListener('change', render);
  const pageChoice = document.getElementById('page-choice');
  pageChoice.addEventListener('change', () => { frame.src = pageChoice.value; });
  const requestedPage = new URLSearchParams(location.search).get('page');
  if ([...pageChoice.options].some(option => option.value === requestedPage)) {
    pageChoice.value = requestedPage;
    frame.src = requestedPage;
  }
  document.getElementById('original').addEventListener('click', () => { original = !original; render(); });
  document.getElementById('collapse').addEventListener('click', event => {
    const settings = document.getElementById('settings');
    settings.hidden = !settings.hidden;
    event.currentTarget.setAttribute('aria-expanded', String(!settings.hidden));
    event.currentTarget.textContent = settings.hidden ? 'show' : 'hide';
  });
  const params = new URLSearchParams(location.search);
  for (const [control, key] of [[navBackground,'navbg'],[pageBackground,'pagebg']]) {
    if ([...control.options].some(option => option.value === params.get(key))) control.value = params.get(key);
  }
  for (const [control, key] of [[navColor,'navcolor'],[pageColor,'pagecolor']]) {
    if (/^#[0-9a-f]{6}$/i.test(params.get(key))) control.value = params.get(key);
  }
  const requestedName = new URLSearchParams(location.search).get('name');
  if ([...nameChoice.options].some(option => option.value === requestedName)) nameChoice.value = requestedName;
  const requested = new URLSearchParams(location.search).get('nav');
  if (Object.hasOwn(defaults, requested)) mode = requested;
  [height.value, tint.value] = defaults[mode];
  frame.addEventListener('load', () => {
    const doc = frame.contentDocument;
    if (!doc || !doc.querySelector('.navbar-title-text')) return;
    doc.body.classList.add('nav-preview');
    const currentPage = new URL(doc.URL).pathname.split('/').pop() || 'index.html';
    if ([...pageChoice.options].some(option => option.value === currentPage)) pageChoice.value = currentPage;
    for (const link of doc.querySelectorAll('#navbar a')) {
      if (new URL(link.href).pathname === new URL(doc.URL).pathname) link.setAttribute('aria-current', 'page');
    }
    style = doc.createElement('style');
    doc.head.append(style);
    inlineNav = doc.createElement('nav');
    inlineNav.id = 'intro-navigation';
    inlineNav.setAttribute('aria-label', 'Explore');
    inlineNav.innerHTML = '<a href="about.html">about ↗</a><a href="projects.html">projects ↗</a><a href="blog.html">blog ↗</a>';
    const intro = doc.querySelector('.home-content-vc, .portfolio-intro');
    const aboutIntro = doc.querySelector('.about-intro');
    if (intro) intro.append(inlineNav);
    else if (aboutIntro) aboutIntro.insertAdjacentElement('afterend', inlineNav);
    else (doc.querySelector('main') || doc.body).prepend(inlineNav);
    brand = doc.querySelector('.navbar-title-text');
    originalBrand = brand.innerHTML;
    // Keep navigation inside the experiment while allowing modified-click to open real pages.
    doc.addEventListener('click', event => {
      const link = event.target.closest('a');
      if (!link || !link.closest('#navbar, #intro-navigation') || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const target = new URL(link.href);
      if (target.origin !== location.origin) return;
      event.preventDefault();
      frame.src = target.href;
    });
    render();
  });
})();
