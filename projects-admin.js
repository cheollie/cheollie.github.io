(() => {
  'use strict';
  const api=window.PORTFOLIO_API_URL.replace(/\/$/,'');
  const editor=document.querySelector('#editor');
  const status=document.querySelector('#editor-status');
  const signout=document.querySelector('#sign-out');
  const key='portfolio-editor-session-v1';
  let session;try{session=sessionStorage.getItem(key);}catch{}
  let projects=[],settings,dirty=false,saving=false;
  const esc=s=>String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const names={identity:'identity & campaigns',editorial:'editorial & print',merch:'merch & stickers',art:'art & lettering',motion:'animation & 3D',spaces:'architecture & spaces',hackathon:'hackathons',personal:'personal projects',community:'clubs & community',coursework:'coursework & research',competitions:'competitions'};
  function store(value){session=value;try{if(value)sessionStorage.setItem(key,value);else sessionStorage.removeItem(key);}catch{}}
  async function request(path,options={}) {
    const res=await fetch(api+path,{...options,headers:{'Content-Type':'application/json',...(session?{Authorization:`Bearer ${session}`} : {}),...options.headers},cache:'no-store'});
    const result=await res.json();
    if(!res.ok){if(res.status===401 && path!=='/admin/login'){store(null);location.reload();}throw new Error(result.error || 'Something went wrong. Please try again.');}
    return result;
  }
  const locked=p=>settings.projects[p.id].access==='password' || (settings.projects[p.id].access!=='public' && settings.lockedGroups.includes(p.group));
  function summary(){
    const visible=projects.filter(p=>!p.hiddenFromAll),publicCount=visible.filter(p=>!locked(p)).length;
    document.querySelector('#save-summary').textContent=`${publicCount} public · ${visible.length-publicCount} password protected${dirty?' · unsaved changes':''}`;
    document.querySelector('#save-settings').disabled=!dirty || saving;
  }
  function changed(){dirty=true;summary();status.textContent='Changes are only a draft until you save.';}
  function renderRows(){
    const q=document.querySelector('#editor-search').value.toLowerCase().trim();
    const group=document.querySelector('#editor-group').value;
    const list=projects.filter(p=>!p.hiddenFromAll && (!group || p.group===group) && (!q || [p.title,p.context,p.yearLabel,...p.tags].join(' ').toLowerCase().includes(q)));
    document.querySelector('#editor-count').textContent=`${list.length} projects`;
    document.querySelector('#project-rows').innerHTML=list.map(p=>{
      const display=settings.projects[p.id],image=p.coverImage || p.images[0];
      const src=image?.startsWith('assets/projects/')?`${api}/${image}`:image;
      return `<tr data-id="${esc(p.id)}"><td><div class="project-cell">${src?`<img src="${esc(src)}" alt="" loading="lazy">`:''}<div><strong>${esc(p.title)}</strong><small>${esc(p.yearLabel)} · ${esc(names[p.group] || p.group)}</small></div></div></td>${['overview','design','engineering'].map(v=>`<td><div class="placement"><input type="checkbox" data-view="${v}" aria-label="Show ${esc(p.title)} in ${v}" ${display.views.includes(v)?'checked':''}><button class="star" data-star="${v}" aria-label="Select ${esc(p.title)} for featured ${v} work" aria-pressed="${display.selectedViews.includes(v)}" ${display.views.includes(v)?'':'disabled'}>${display.selectedViews.includes(v)?'★':'☆'}</button></div></td>`).join('')}<td><select class="access-select" aria-label="Access for ${esc(p.title)}">${[['inherit','section default'],['public','public'],['password','password']].map(([v,label])=>`<option value="${v}" ${display.access===v?'selected':''}>${label}</option>`).join('')}</select><span class="access-result">${locked(p)?'🔒 password protected':'public'}</span></td><td><button class="all-only" data-all-only aria-pressed="${!display.views.length}">all work only</button></td></tr>`;
    }).join('');
  }
  function render(){
    signout.hidden=false;
    const groups=[...new Set(projects.map(p=>p.group))];
    editor.innerHTML=`<div class="save-bar"><p id="save-summary" class="counts"></p><div class="save-actions"><button id="export-settings">export settings</button><button id="save-settings" disabled>save changes</button></div></div><section class="section-access"><h2>Section access</h2><p>Checked sections require the viewer password by default. Individual project access can override that default.</p><div class="section-locks">${groups.map(g=>`<label><input type="checkbox" data-lock="${esc(g)}" ${settings.lockedGroups.includes(g)?'checked':''}>🔒 ${esc(names[g] || g)}</label>`).join('')}</div><p class="help">Nothing becomes public until you change access and save. Artwork/PDF links remain shareable; portfolio pages stay out of search results.</p></section><h2>Project placement</h2><p>Tick a view to include a project. Use ★ to put it in that view’s selected row. “All work only” removes it from every focused view.</p><div class="editor-toolbar"><input type="search" id="editor-search" placeholder="Find a project…" aria-label="Search projects"><select id="editor-group" aria-label="Filter sections"><option value="">all sections</option>${groups.map(g=>`<option value="${esc(g)}">${esc(names[g] || g)}</option>`).join('')}</select><span id="editor-count"></span></div><div class="project-table"><table><thead><tr><th>project</th><th>overview ★</th><th>design ★</th><th>engineering ★</th><th>access</th><th>placement</th></tr></thead><tbody id="project-rows"></tbody></table></div>`;
    renderRows();summary();
    document.querySelector('#editor-search').addEventListener('input',renderRows);
    document.querySelector('#editor-group').addEventListener('change',renderRows);
    document.querySelector('#save-settings').addEventListener('click',async()=>{
      saving=true;summary();status.textContent='Saving…';
      try{const result=await request('/admin/settings',{method:'PUT',body:JSON.stringify(settings)});settings=result.settings;dirty=false;status.textContent='Saved. Changes may take about a minute to appear everywhere.';}
      catch(error){status.textContent=error.message;}
      finally{saving=false;summary();}
    });
    document.querySelector('#export-settings').addEventListener('click',()=>{
      const url=URL.createObjectURL(new Blob([JSON.stringify(settings,null,2)],{type:'application/json'}));
      const a=document.createElement('a');a.href=url;a.download='portfolio-settings.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    });
  }
  editor.addEventListener('change',e=>{
    if(e.target.dataset.lock){const group=e.target.dataset.lock;settings.lockedGroups=e.target.checked?[...new Set([...settings.lockedGroups,group])]:settings.lockedGroups.filter(g=>g!==group);changed();renderRows();return;}
    const id=e.target.closest('[data-id]')?.dataset.id;if(!id)return;
    const display=settings.projects[id];
    if(e.target.dataset.view){const v=e.target.dataset.view;display.views=e.target.checked?[...new Set([...display.views,v])]:display.views.filter(x=>x!==v);display.selectedViews=display.selectedViews.filter(x=>display.views.includes(x));}
    if(e.target.classList.contains('access-select'))display.access=e.target.value;
    changed();renderRows();
  });
  editor.addEventListener('click',e=>{
    const id=e.target.closest('[data-id]')?.dataset.id;if(!id)return;
    const display=settings.projects[id];
    if(e.target.dataset.star){const v=e.target.dataset.star;display.selectedViews=display.selectedViews.includes(v)?display.selectedViews.filter(x=>x!==v):[...display.selectedViews,v];changed();renderRows();}
    if(e.target.hasAttribute('data-all-only')){display.views=[];display.selectedViews=[];changed();renderRows();}
  });
  async function load(){const result=await request('/admin/settings');projects=result.projects;settings=result.settings;render();}
  document.querySelector('#admin-login').addEventListener('submit',async e=>{
    e.preventDefault();const button=e.target.querySelector('button');button.disabled=true;status.textContent='Opening editor…';
    try{const result=await request('/admin/login',{method:'POST',body:JSON.stringify({password:e.target.elements.password.value})});store(result.token);await load();status.textContent='';}catch(error){status.textContent=error.message;button.disabled=false;}
  });
  signout.addEventListener('click',()=>{if(!dirty || confirm('Discard unsaved changes and sign out?')){store(null);location.reload();}});
  addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
  if(session)load().catch(error=>{status.textContent=error.message;});
})();
