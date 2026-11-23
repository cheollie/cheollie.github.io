(() => {
  const frame = document.getElementById('preview');
  const tint = document.getElementById('tint');
  const navBackground = document.getElementById('nav-background');
  const navColor = document.getElementById('nav-color');
  const pageBackground = document.getElementById('page-background');
  const position = document.getElementById('position');
  const cleanPage = path => ({'index.html':'/','about.html':'/about','projects.html':'/projects/','blog.html':'/blog','/index.html':'/','/about.html':'/about','/projects.html':'/projects/','/blog.html':'/blog'}[path] || path);
  const defaults = { side: 0, bare: 0, float: 88, center: 0 };
  const nameDivider = document.getElementById('name-divider');
  let mode = 'bare';
  let original = false;
  let style;
  let brand;
  let originalBrand;
  const nameChoice = document.getElementById('name-choice');
  const linksAlignment = document.getElementById('links-alignment');
  const spacingControls=['side-top','side-name-gap','side-link-gap','brand-gap'].map(id=>document.getElementById(id));
  const [sideTop,sideNameGap,sideLinkGap,brandGap]=spacingControls;

  function render() {
    if (!style) return;
    document.getElementById('tint-value').value = `${tint.value}%`;
    document.getElementById('position-label').hidden = mode !== 'float' || original;
    document.getElementById('original').setAttribute('aria-pressed', String(original));
    document.getElementById('original').textContent = original ? 'back to experiment' : 'compare original';
    for (const button of document.querySelectorAll('[data-mode]')) button.setAttribute('aria-pressed', String(!original && button.dataset.mode === mode));
    tint.disabled = original;
    document.getElementById('side-spacing').hidden=original || mode!=='side';
    document.getElementById('brand-spacing').hidden=original || nameChoice.value!=='chelsea-w-flower';
    for(const control of spacingControls){control.disabled=original;document.getElementById(control.id+'-value').value=control.value+'px';}
    sideNameGap.disabled=original || nameChoice.value==='none';
    for (const control of [navBackground, navColor, pageBackground]) control.disabled = original;
    document.getElementById('custom-nav-label').hidden = navBackground.value !== 'custom';
    nameChoice.disabled = original;
    document.getElementById('divider-label').hidden = original || mode !== 'center' || nameChoice.value === 'none';
    document.getElementById('alignment-label').hidden = original || nameChoice.value !== 'none' || mode === 'side' || mode === 'center';
    linksAlignment.disabled = original;
    brand.hidden = !original && nameChoice.value === 'none';
    if (original || nameChoice.value === 'original') brand.innerHTML = originalBrand;
    else {
      const withFlower = nameChoice.value.endsWith('-flower') || nameChoice.value === 'sunflower';
      const label = nameChoice.value === 'sunflower' ? '' : nameChoice.value === 'cw' ? 'cw' : nameChoice.value.startsWith('chelsea-w') ? 'chelsea w' : 'chelsea';
      brand.replaceChildren();
      if (withFlower) {
        const flower = brand.ownerDocument.createElement('span');
        flower.innerHTML = '<img src="/icons/sunflower.svg" alt="">';
        flower.setAttribute('aria-hidden', 'true');
        flower.className = 'name-flower brand-sunflower';
        brand.append(flower);
      }
      if (withFlower && label) {
        const dot = brand.ownerDocument.createElement('span');
        dot.textContent = '·';dot.className = 'name-dot';dot.setAttribute('aria-hidden', 'true');brand.append(dot);
      }
      brand.append(brand.ownerDocument.createTextNode(label));
    }
    brand.setAttribute('aria-label', 'Home');
    if (original) { style.textContent = ''; return; }
    const h = 64;
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
      .nav-preview #navbar:has(.navbar-title-text[hidden]) #subnavbarleft{display:none}
      .nav-preview #navbar:has(.navbar-title-text[hidden]){justify-content:${mode === 'side' ? 'flex-start' : linksAlignment.value === 'center' ? 'center' : 'flex-end'}}
      .nav-preview #navbar:has(.navbar-title-text[hidden]) #subnavbarright{margin-top:0;align-items:${mode === 'side' ? 'flex-start' : 'center'};justify-content:${mode === 'side' ? 'flex-start' : 'center'};text-align:${mode === 'side' ? 'left' : 'center'}}
      .nav-preview #navbar .navbar-title-text[hidden]{display:none}
      .nav-preview #navbar .navbar-title-text{display:inline-flex;align-items:center;gap:${Number(brandGap.value)}px;font-weight:850}
      .nav-preview .name-dot{font-size:16px;font-weight:400;color:#8b8779}
      .nav-preview #navbar .name-flower{display:inline-grid;place-items:center;flex:none;width:26px;height:26px;line-height:1}
      .nav-preview #navbar{box-sizing:border-box;position:fixed;z-index:30;display:flex;align-items:center;justify-content:space-between;height:${h}px;padding:0 34px;background:${navFill};box-shadow:none;border:0;transition:none}
      .nav-preview #subnavbarleft,.nav-preview #subnavbarright{display:flex;align-items:center;padding:0}
      .nav-preview #subnavbarright{gap:28px}
      .nav-preview .navbar-title-text{font-size:22px;white-space:nowrap}
      .nav-preview .navbar-title-text .semibold{font-size:22px!important}
      .nav-preview .navbar-subtitle-text{font-size:16px;padding:12px 0;margin:0;background-image:none;text-underline-offset:5px;text-decoration-thickness:1px}
      .nav-preview .navbar-subtitle-text:hover{background-image:none;text-decoration-line:underline}
      .nav-preview #navbar a:focus-visible{outline:2px solid #837756;outline-offset:5px}
      @media(max-width:800px){.home-page .home-content-vc{top:120px;transform:none}.nav-preview #navbar{padding:0 22px}.nav-preview #subnavbarright{gap:18px}.nav-preview .navbar-title-text{font-size:19px}.nav-preview .navbar-subtitle-text{font-size:14px}}
      @media(max-width:420px){.nav-preview #navbar{padding:0 16px}.nav-preview #subnavbarright{gap:14px}.nav-preview .navbar-title-text .semibold{display:none}}
    `;
    const variants = {
      bare: `.nav-preview #navbar{left:0;top:16px;width:100%}`,
      center: `
        .nav-preview #navbar,.nav-preview #navbar:has(.navbar-title-text[hidden]){left:50%;top:16px;transform:translateX(-50%);width:max-content;max-width:calc(100% - 24px);justify-content:center;gap:28px;padding:0;background:transparent;border:0;border-radius:0;box-shadow:none}
        .nav-preview #navbar #subnavbarleft{flex-shrink:0}
        .nav-preview #navbar #subnavbarleft:after{content:${nameDivider.value === 'line' ? "'|'" : "''"};margin-left:${nameDivider.value === 'line' ? '28px' : '0'};font-size:18px;font-weight:400;color:#8b8779}
        @media(max-width:800px){.nav-preview #navbar{gap:18px}.nav-preview #navbar #subnavbarleft:after{margin-left:${nameDivider.value === 'line' ? '18px' : '0'}}}
      `,
      side: `
        .nav-preview #navbar{top:${Number(sideTop.value)}px;left:38px;bottom:38px;width:216px;height:auto;padding:14px;flex-direction:column;align-items:flex-start;justify-content:flex-start;border-radius:12px}
        .nav-preview #subnavbarright{flex-direction:column;align-items:flex-start;text-align:left;gap:${Number(sideLinkGap.value)}px;margin-top:${Number(sideNameGap.value)}px}
        .home-page .home-content-vc{left:280px;padding-left:0;max-width:calc(100% - 310px)}
        @media(max-width:800px){.nav-preview #navbar{left:12px;top:${Number(sideTop.value)}px;bottom:auto;width:180px;padding:8px}.nav-preview #navbar .navbar-title-text{font-size:16px;gap:${Math.min(Number(brandGap.value),16)}px}.nav-preview #subnavbarright{margin-top:${Number(sideNameGap.value)}px;gap:${Number(sideLinkGap.value)}px}.home-page .home-content-vc{left:210px;top:120px;transform:none;width:calc(100% - 220px);max-width:none;padding:0 10px}.home-page .home-title{font-size:22px}.home-page .landing-summary{font-size:13px}}
      `,
      float: `
        .nav-preview #navbar{left:50%;transform:translateX(-50%);width:min(520px,calc(100% - 32px));background:${navFill};top:${position.value === 'top' ? '24px' : 'auto'};bottom:${position.value === 'bottom' ? '24px' : 'auto'};border-radius:18px;padding:0 24px;border:1px solid rgba(145,126,61,.13);box-shadow:0 5px 20px rgba(76,62,14,.08)}
        @media(max-width:800px){.nav-preview #navbar{padding:0 20px}.nav-preview #subnavbarright{gap:16px}}
      `
    };
    const scrollLayout = `
      .scroll-page.nav-preview{padding-top:${mode === 'float' ? h + 48 : mode === 'side' ? 24 : h + 16}px;box-sizing:border-box}
      ${mode === 'side' ? '.scroll-page.nav-preview{padding-left:250px}@media(max-width:800px){.scroll-page.nav-preview{padding-left:200px}}' : ''}
      .nav-preview #navbar .navbar-subtitle-text[aria-current=page]{text-decoration:underline;text-decoration-color:#9a8544;text-underline-offset:5px}
    `;
    const pageFills = {
      white:'#ffffff',
      wash:'radial-gradient(ellipse at 100% 0%, #fff0b8 0%, rgba(255,246,210,.7) 30%, transparent 70%), #ffffff'
    };
    const pageFill = pageFills[pageBackground.value];
    const pageStyle = pageFill ? `body.nav-preview{background:${pageFill};background-attachment:fixed}` : '';
    const contentMargins = mode === 'side' ? `
      .nav-preview{--preview-gutter:clamp(24px,6vw,80px);--preview-rail:${mode === 'side' ? '250px' : '0px'}}
      .blog-page.nav-preview .home-content-vc{box-sizing:border-box;left:max(calc(var(--preview-rail) + var(--preview-gutter)),calc((100vw - var(--preview-rail) - 1200px)/2 + var(--preview-rail) + var(--preview-gutter)));padding:0;width:min(420px,calc((100vw - var(--preview-rail)) * .45));max-width:none}
      @media(max-width:800px){
        .nav-preview{--preview-rail:${mode === 'side' ? '200px' : '0px'}}
        .blog-page.nav-preview .home-content-vc{width:calc(100% - var(--preview-rail) - 2 * var(--preview-gutter));max-width:560px}
      }
    ` : '';
    style.textContent = common + variants[mode] + scrollLayout + pageStyle + contentMargins;
    const url = new URL(location.href);
    url.searchParams.set('nav', mode);
    for(const control of spacingControls)url.searchParams.set(control.id,control.value);
    url.searchParams.set('name', nameChoice.value);
    url.searchParams.set('align', linksAlignment.value);
    url.searchParams.set('divider', nameDivider.value);
    url.searchParams.set('navbg', navBackground.value);
    url.searchParams.set('pagebg', pageBackground.value);
    url.searchParams.set('navcolor', navColor.value);
    url.searchParams.delete('pagecolor');
    url.searchParams.set('page', document.getElementById('page-choice').value);
    history.replaceState(null, '', url);
  }
  for (const button of document.querySelectorAll('[data-mode]')) {
    button.addEventListener('click', () => {
      mode = button.dataset.mode;
      original = false;
      tint.value = defaults[mode];
      render();
    });
  }
  tint.addEventListener('input', render);
  for(const control of spacingControls)control.addEventListener('input',render);
  position.addEventListener('change', render);
  for (const control of [navBackground, navColor, pageBackground]) control.addEventListener('input', render);
  nameChoice.addEventListener('change', render);
  linksAlignment.addEventListener('change', render);
  nameDivider.addEventListener('change', render);
  const pageChoice = document.getElementById('page-choice');
  pageChoice.addEventListener('change', () => { frame.src = pageChoice.value; });
  const requestedPage = cleanPage(new URLSearchParams(location.search).get('page'));
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
  for(const control of spacingControls){const value=params.get(control.id);if(value!==null && Number.isFinite(Number(value)))control.value=String(Math.max(Number(control.min),Math.min(Number(control.max),Number(value))));}
  if (['none','line'].includes(params.get('divider'))) nameDivider.value = params.get('divider');
  if (['right', 'center'].includes(params.get('align'))) linksAlignment.value = params.get('align');
  for (const [control, key] of [[navBackground,'navbg'],[pageBackground,'pagebg']]) {
    if ([...control.options].some(option => option.value === params.get(key))) control.value = params.get(key);
  }
  for (const [control, key] of [[navColor,'navcolor']]) {
    if (/^#[0-9a-f]{6}$/i.test(params.get(key))) control.value = params.get(key);
  }
  const requestedName = ({'chelsea-flower':'chelsea-w-flower'}[params.get('name')] || params.get('name'));
  if ([...nameChoice.options].some(option => option.value === requestedName)) nameChoice.value = requestedName;
  const requested = new URLSearchParams(location.search).get('nav');
  if (Object.hasOwn(defaults, requested)) mode = requested;
  tint.value = defaults[mode];
  frame.addEventListener('load', () => {
    const doc = frame.contentDocument;
    if (!doc || !doc.querySelector('.navbar-title-text')) return;
    doc.body.classList.add('nav-preview');
    const pageURL = new URL(doc.URL);
    const currentPage = cleanPage(pageURL.pathname)+(pageURL.hash==='#employment'?'#employment':'');
    if ([...pageChoice.options].some(option => option.value === currentPage)) pageChoice.value = currentPage;
    for (const link of doc.querySelectorAll('#navbar a')) {
      if (cleanPage(new URL(link.href).pathname) === cleanPage(new URL(doc.URL).pathname)) link.setAttribute('aria-current', 'page');
    }
    style = doc.createElement('style');
    doc.head.append(style);
    brand = doc.querySelector('.navbar-title-text');
    originalBrand = brand.innerHTML;
    // Keep navigation inside the experiment while allowing modified-click to open real pages.
    doc.addEventListener('click', event => {
      const link = event.target.closest('a');
      if (!link || !link.closest('#navbar') || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const target = new URL(link.href);
      if (target.origin !== location.origin) return;
      event.preventDefault();
      frame.src = target.href;
    });
    render();
  });
})();

