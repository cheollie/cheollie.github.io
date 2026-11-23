(() => {
  'use strict';
  const projects = window.PORTFOLIO_PROJECTS;
  const catalog = document.querySelector('#catalog');
  const panel = document.querySelector('#project-panel');
  const viewer = document.querySelector('#image-viewer');
  const params = new URLSearchParams(location.search);
  const views = ['overview', 'design', 'engineering', 'all'];
  let view = views.includes(params.get('view')) ? params.get('view') : 'overview';
  let returnFocus;
  let filterView = view;
  const esc = value => String(value || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const artifacts = p => `<div class="artifact-links">${Object.entries(p.links).map(([label, href]) => `<a href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>`).join('')}</div>`;
  const tags = p => `<div class="work-tags">${p.tags.slice(0,3).map(t => `<span>${esc(t)}</span>`).join('')}${(p.awards || []).map(a => `<span class="award-tag" title="${esc(a.detail)}" aria-label="Award: ${esc(a.label)}">🏆 ${esc(a.label)}</span>`).join('')}</div>`;
  function media(p) {
    if (p.images.length) return `<img src="${esc(p.coverImage || p.images[0])}" alt="${esc(p.title)} — project preview" loading="lazy" decoding="async">${p.previewLabel ? `<span class="media-caption">${esc(p.previewLabel)}</span>` : ''}`;
    if (p.video) return `<video src="${esc(p.video)}" muted playsinline preload="metadata" aria-label="${esc(p.title)} animation"></video><span class="media-caption">animation · open to play</span>`;
    return `<span class="text-preview"><small>${esc(p.context)}</small><strong>${esc(p.title)}</strong><small>project details ↗</small></span>`;
  }
  function card(p) {
    return `<article class="work-card"><button class="work-media" data-project="${p.id}" aria-label="Explore ${esc(p.title)}">${media(p)}</button><p class="work-context">${esc(p.context)} <span class="work-year">· ${esc(p.yearLabel || 'c. 2022–23')}</span></p><button class="work-title" data-project="${p.id}">${esc(p.title)}</button><p class="work-description">${esc(p.description)}</p>${tags(p)}${artifacts(p)}</article>`;
  }
  const yearValue = p => {
    const m = String(p.yearLabel || '').match(/(20\d{2})(?:[–-](\d{4}|\d{2}))?/);
    return m ? Number(m[2] ? (m[2].length === 2 ? '20' + m[2] : m[2]) : m[1]) : 0;
  };
  const newestFirst = list => [...list].sort((a,b) => yearValue(b) - yearValue(a));
  const selected = (lens = view) => projects.filter(p => !p.hiddenFromAll && (p.display ? p.display.selectedViews.includes(lens) : p.featured)).sort((a,b) => (a.selectedOrder?.[lens] ?? 999) - (b.selectedOrder?.[lens] ?? 999));
  const inView = p => p.display ? p.display.views.includes(view) : !p.archiveOnly;
  function shelf(id, title, subtitle, items, large = false) {
    items = items.filter(p => !p.hiddenFromAll && inView(p));
    if (!large) items = newestFirst(items);
    if (!items.length) return '';
    return `<section class="portfolio-shelf"><div class="shelf-heading"><div><h2>${title}</h2><p>${subtitle}</p></div><div class="shelf-tools"><button class="view-shelf" data-filter="${id}">view all ↗</button><button data-scroll="-1" aria-label="Scroll ${title} left">←</button><button data-scroll="1" aria-label="Scroll ${title} right">→</button></div></div><div class="portfolio-row ${large ? 'featured' : ''}">${items.map(card).join('')}</div></section>`;
  }
  function filterItems(key) {
    if (key === 'selected') return selected(filterView);
    if (projects.some(p => p.shelves?.includes(key))) return projects.filter(p => p.shelves?.includes(key));
    if (key === 'personal') return projects.filter(p => p.group === 'personal' || (p.group === 'motion' && p.eng));
    if (key === 'selected-design') return selected('design');
    if (key === 'built') return projects.filter(p => p.eng && !p.featured && !['identity','art','competitions'].includes(p.group));
    if (key === 'creative') return projects.filter(p => ['identity','editorial','merch','art','motion','spaces'].includes(p.group));
    if (key === 'competition') return projects.filter(p => p.id === 'lyonctf' || p.group === 'competitions');
    if (key === 'interfaces') return projects.filter(p => p.design && ['hackathon','community','coursework'].includes(p.group));
    return projects.filter(p => p.group === key || p.sections?.includes(key));
  }
  function renderView() {
    document.querySelectorAll('[data-view]').forEach(a => a.setAttribute('aria-current', a.dataset.view === view ? 'page' : 'false'));
    document.querySelector('#work-count').textContent = projects.filter(p => !p.hiddenFromAll).length;
    if (view === 'all') { renderAll(); return; }
    let output = shelf('selected', 'selected work', 'A few places to start.', selected(), true);
    if (view === 'overview') {
      output += shelf('products','products & interfaces','Interfaces, workflows, and the people they were made for.',filterItems('products'));
      output += shelf('brands','identities & campaigns','Visual systems for organizations and communities.',filterItems('brands'));
      output += shelf('print','print & physical objects','Editorial design, event materials, and merch.',filterItems('print'));
      output += shelf('play','interactive & playful','Games, tools, and small worlds.',filterItems('play'));
      output += shelf('studies','creative studies','Lettering, animation, and imagined spaces.',filterItems('studies'));
      output += shelf('technical','research & technical experiments','Exploring ideas through software and hardware.',filterItems('technical'));
    } else if (view === 'design') {
      output = shelf('selected-design','selected design','Product design, visual identities, and editorial work.',selected(),true);
      output += shelf('products','products & interfaces','From Figma explorations to working experiences.',filterItems('products'));
      output += shelf('brands','identities & campaigns','Visual systems for organizations and communities.',filterItems('brands'));
      output += shelf('print','print & physical objects','Editorial design, event materials, and merch.',filterItems('print'));
      output += shelf('motion','animation & 3D','Moving characters and interactive scenes.',filterItems('motion'));
      output += shelf('studies','art & spaces','Lettering, illustration, and imagined rooms.',filterItems('studies'));
    } else {
      output += shelf('hackathon-builds','hackathon builds','Short timelines, teams, and plenty of experiments.',filterItems('hackathon-builds'));
      output += shelf('personal-community','personal & community projects','Software made for myself and the people around me.',filterItems('personal-community'));
      output += shelf('research-coursework','coursework & research','Learning by building.',filterItems('research-coursework'));
    }
    const remaining=projects.filter(p=>p.display && inView(p) && !p.hiddenFromAll && !output.includes(`data-project="${p.id}"`));
    output += shelf('other','more work','More from this view.',remaining);
    catalog.innerHTML = output;
  }
  function renderAll(preset = '') {
    const groups = [...new Set(projects.map(p => p.group))];
    const tagList = [...new Set(projects.flatMap(p => p.tags))].sort();
    catalog.innerHTML = `<h2 class="catalog-label">the whole collection</h2><div class="catalog-shortcuts" aria-label="Browse disciplines"><button data-quick-tag="">everything</button><button data-quick-tag="calligraphy">calligraphy</button><button data-quick-tag="architecture">architecture</button><button data-quick-tag="graphic design">graphics</button><button data-quick-tag="editorial design">editorial</button><button data-quick-tag="UI design">interfaces</button></div><div class="catalog-controls"><input type="search" id="project-search" aria-label="Search projects" placeholder="Search projects, skills, or organizations…"><select id="context-filter" aria-label="Filter by context"><option value="">all contexts</option>${groups.map(g => `<option value="${g}">${g}</option>`).join('')}</select><select id="tag-filter" aria-label="Filter by skill"><option value="">all disciplines</option>${tagList.map(t => `<option>${esc(t)}</option>`).join('')}</select><select id="artifact-filter" aria-label="Filter by artifact"><option value="">all artifacts</option><option value="Figma">Figma</option><option value="code">code</option><option value="Devpost">Devpost</option><option value="video">video</option><option value="PDF">PDF</option></select></div><p class="catalog-count" role="status" id="result-count"></p><div class="catalog-grid" id="all-grid"></div>`;
    const categories = {products:'products & interfaces',brands:'identities & campaigns',print:'print & physical objects',play:'interactive & playful',studies:'creative studies',technical:'research & technical experiments'};
    catalog.querySelector('.catalog-controls').insertAdjacentHTML('beforeend',`<select id="shelf-filter" aria-label="Filter by collection category"><option value="">all categories</option>${Object.entries(categories).map(([id,title]) => `<option value="${id}">${title}</option>`).join('')}</select>`);
    if (categories[preset]) document.querySelector('#shelf-filter').value = preset;
    if (groups.includes(preset)) document.querySelector('#context-filter').value = preset;
    const update = () => {
      const q = document.querySelector('#project-search').value.toLowerCase().trim();
      const group = document.querySelector('#context-filter').value;
      const tag = document.querySelector('#tag-filter').value;
      const artifact = document.querySelector('#artifact-filter').value;
      const category = document.querySelector('#shelf-filter').value;
      const presetItems = preset ? filterItems(preset) : projects;
      const list = presetItems.filter(p => !p.hiddenFromAll && (!category || p.shelves?.includes(category)) && (!q || [p.title,p.description,p.context,p.yearLabel,...p.tags,...(p.collectionSections || []).map(part => part.title),...(p.technologies || []),...(p.sourceFiles || [])].join(' ').toLowerCase().includes(q)) && (!group || p.group === group) && (!tag || p.tags.includes(tag)) && (!artifact || (artifact === 'video' ? p.video || p.collectionSections?.some(part => part.video) : p.links[artifact] || p.collectionSections?.some(part => part.links?.[artifact]))));
      catalog.querySelectorAll('[data-quick-tag]').forEach(b => b.setAttribute('aria-pressed',String(b.dataset.quickTag === tag)));
      document.querySelector('#result-count').textContent = `${list.length} ${list.length === 1 ? 'project' : 'projects'}`;
      document.querySelector('#all-grid').innerHTML = list.length ? newestFirst(list).map(card).join('') : '<p class="empty-catalog">No matches yet. <button id="reset-filters">Clear filters</button></p>';
    };
    catalog.querySelectorAll('input,select').forEach(el => el.addEventListener('input',update));
    update();
  }
  function figures(images, title, labels = [], themes = []) {
    return images.map((src,i) => `<figure><button ${themes[i] ? `data-image-theme="${themes[i] === 'dark' ? 'dark' : 'light'}"` : ''} data-enlarge="${esc(src)}" data-alt="${esc(title)} — image ${i+1}" aria-label="Enlarge ${esc(title)} image ${i+1}"><img src="${esc(src)}" alt="${esc(title)} — image ${i+1}" loading="lazy"></button>${labels[i] ? `<figcaption>${esc(labels[i])}</figcaption>` : ''}</figure>`).join('');
  }
  function detail(p, fullPage = false) {
    const collection = p.collectionSections?.map((part,i) => {
      const images = (part.images || []).filter(src => p.images.includes(src));
      const labels = images.map(src => part.imageLabels?.[(part.images || []).indexOf(src)] || '');
      return `<section class="collection-section" id="collection-${esc(p.id)}-${i}"><h3>${esc(part.title)}</h3>${part.description ? `<p>${esc(part.description)}</p>` : ''}${artifacts({links:part.links || {}})}<div class="panel-gallery">${figures(images,part.title,labels,part.imageThemes)}${part.video ? `<video controls playsinline preload="none" src="${esc(part.video)}"></video>` : ''}</div></section>`;
    }).join('');
    const extraImages = p.collectionSections ? p.images.filter(src => !p.collectionSections.some(part => part.images?.includes(src))) : [];
    const gallery = collection
      ? `<nav class="collection-nav" aria-label="Project collections">${p.collectionSections.map((part,i) => `<a href="#collection-${esc(p.id)}-${i}">${esc(part.title)}</a>`).join('')}</nav>${collection}${extraImages.length ? `<section class="collection-section"><h3>more work</h3><div class="panel-gallery">${figures(extraImages,p.title)}</div></section>` : ''}`
      : p.postGalleries?.length
      ? p.postGalleries.map(post => `<section class="post-gallery"><h3>${esc(post.title)}</h3><a class="panel-case-link" href="${esc(post.url)}" target="_blank" rel="noopener noreferrer">view published post ↗</a><div class="panel-gallery">${figures(post.images,post.title)}</div></section>`).join('') + `<section class="additional-campaign"><h3>more campaign work</h3><div class="panel-gallery">${figures(p.images,p.title,p.imageLabels)}</div></section>`
      : `<div class="panel-gallery">${figures(p.images,p.title,p.imageLabels,p.imageThemes)}${p.video ? `<video controls playsinline preload="none" poster="${esc(p.images[0] || '')}" src="${esc(p.video)}"></video>` : ''}</div>`;
    const scenes = (p.embeds || []).map(scene => `<section class="project-scene"><h3>${esc(scene.title)}</h3><iframe src="${esc(scene.url)}" title="${esc(scene.title)}" loading="lazy" allow="fullscreen" referrerpolicy="strict-origin-when-cross-origin"></iframe></section>`).join('');
    const related = (p.relatedWork || []).filter(item => projects.some(project => project.id === item.id));
    return `<div class="panel-body"><p class="work-context">${esc(p.context)} <span class="work-year">· ${esc(p.yearLabel || '')}</span></p><h2 id="panel-title">${esc(p.title)}</h2><p class="panel-description">${esc(p.description)}</p>${tags(p)}${artifacts(p)}${scenes}${gallery}${p.role ? `<h3>my contribution</h3><p>${esc(p.role)}</p>` : ''}${p.detail ? `<h3>about the project</h3><p>${esc(p.detail)}</p>` : ''}${p.technologies?.length ? `<h3>built with</h3><p>${p.technologies.map(esc).join(' · ')}</p>` : ''}${p.references && !p.postGalleries ? `<h3>published posts</h3><div class="artifact-links">${Object.entries(p.references).map(([label,url]) => `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>`).join('')}</div>` : ''}${related.length ? `<h3>related work</h3><div class="artifact-links">${related.map(item => `<button data-project="${esc(item.id)}">${esc(item.label)} ↗</button>`).join('')}</div>` : ''}${!fullPage ? `<a class="panel-case-link" href="?view=${view}&case=${p.id}">open project page ↗</a>` : ''}</div>`;
  }
  function openProject(id, updateURL = true) {
    let p = projects.find(p => p.id === id); if (!p) return;
    p = projects.find(project => project.id === p.groupedInto) || p;
    id = p.id;
    returnFocus = document.activeElement;
    document.querySelector('#panel-content').innerHTML = detail(p);
    panel.scrollTop = 0;
    if (!panel.open) panel.showModal();
    document.querySelector('#close-panel').focus();
    if (updateURL) { const url=new URL(location.href);url.searchParams.set('project',id);history.pushState({},'',url); }
  }
  function closeProject() {
    panel.querySelectorAll('video').forEach(v => v.pause());
    panel.close();
    const url=new URL(location.href);url.searchParams.delete('project');history.replaceState({},'',url);
    if (returnFocus?.isConnected) returnFocus.focus();
  }
  document.querySelector('#close-panel').addEventListener('click',closeProject);
  panel.addEventListener('close', () => { document.querySelector('#panel-content').innerHTML = ''; });
  panel.addEventListener('cancel',e => {e.preventDefault();closeProject();});
  panel.addEventListener('click',e => {if(e.target === panel && e.clientX < panel.getBoundingClientRect().left) closeProject();});
  document.querySelector('#close-image').addEventListener('click',() => viewer.close());
  document.addEventListener('error',e => {
    if(e.target.tagName !== 'IMG') return;
    const preview=e.target.closest('.work-media');
    if(preview) {
      const p=projects.find(p=>p.id===preview.dataset.project);
      if(p) preview.innerHTML=`<span class="text-preview"><small>${esc(p.context)}</small><strong>${esc(p.title)}</strong><small>project details ↗</small></span>`;
    }
  },true);
  document.addEventListener('click',e => {
    const jump=e.target.closest('.collection-nav a'); if(jump) {e.preventDefault();document.getElementById(jump.getAttribute('href').slice(1))?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});return;}
    const project=e.target.closest('[data-project]'); if(project) openProject(project.dataset.project);
    const zoom=e.target.closest('[data-enlarge]'); if(zoom) {document.querySelector('#full-image').src=zoom.dataset.enlarge;document.querySelector('#full-image').alt=zoom.dataset.alt;viewer.dataset.theme=zoom.dataset.imageTheme || '';viewer.showModal();}
    const scroll=e.target.closest('[data-scroll]'); if(scroll) scroll.closest('.portfolio-shelf').querySelector('.portfolio-row').scrollBy({left:Number(scroll.dataset.scroll)*500,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
    const quick=e.target.closest('[data-quick-tag]'); if(quick) {const select=document.querySelector('#tag-filter');select.value=quick.dataset.quickTag;select.dispatchEvent(new Event('input'));}
    const filter=e.target.closest('[data-filter]'); if(filter) {filterView=view;view='all';const url=new URL(location.href);url.search='?view=all';history.pushState({},'',url);renderView();renderAll(filter.dataset.filter);}
    const tab=e.target.closest('[data-view]'); if(tab) {e.preventDefault();view=tab.dataset.view;history.pushState({},'',`?view=${view}`);renderView();}
    if(e.target.id === 'reset-filters') renderAll();
  });
  function route() {
    const query=new URLSearchParams(location.search);
    view=views.includes(query.get('view'))?query.get('view'):'overview';
    let p=projects.find(p=>p.id===query.get('case'));
    p=projects.find(project=>project.id===p?.groupedInto) || p;
    document.querySelector('.portfolio-tabs').hidden=!!p;
    document.querySelector('.portfolio-intro').hidden=!!p;
    if(p){catalog.innerHTML=`<article class="case-reading"><a class="case-back" href="?view=${view}">← back to projects</a>${detail(p,true)}</article>`;document.title=`${p.title} · cheollie`;}
    else {renderView();document.title='Projects · cheollie';}
    if(query.has('project')) openProject(query.get('project'),false);else if(panel.open) panel.close();
  }
  addEventListener('popstate',route);
  route();
})();
