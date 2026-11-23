(() => {
  'use strict';
  if(location.pathname==='/projects-admin.html')history.replaceState(history.state,'','/projects-admin'+location.search+location.hash);
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
  const projectValue=p=>({...p,...settings.projects[p.id]?.content});
  const contentDialog=document.createElement('dialog');contentDialog.id='content-editor';document.body.append(contentDialog);
  let editingDraft;
  function gallery(){
    contentDialog.querySelector('#edit-media').innerHTML=editingDraft.images.map((url,i)=>`<figure><img src="${esc(url.startsWith('assets/projects/')?api+'/'+url:url)}" alt="Image ${i+1}"><figcaption><button type="button" data-cover="${i}" aria-pressed="${editingDraft.coverImage===url}">${editingDraft.coverImage===url?'cover':'use as cover'}</button><button type="button" data-remove="${i}">remove</button></figcaption></figure>`).join('');

  }
  function editProject(id){
    const p=projectValue(projects.find(p=>p.id===id));
    editingDraft=JSON.parse(JSON.stringify(p));
    contentDialog.innerHTML=`<form id="content-form"><div class="edit-top"><h2>Edit project</h2><button type="button" data-cancel-edit aria-label="Close editor">close ×</button></div><label>Title<input name="title" value="${esc(p.title)}" required maxlength="200"></label><div class="edit-pair"><label>Context<input name="context" value="${esc(p.context)}" maxlength="200"></label><label>Year<input name="yearLabel" value="${esc(p.yearLabel)}" maxlength="50"></label></div><label>Card description<textarea name="description" rows="3" maxlength="2000">${esc(p.description)}</textarea></label><label>About the project<textarea name="detail" rows="5" maxlength="12000">${esc(p.detail)}</textarea></label><label>My contribution<textarea name="role" rows="3" maxlength="4000">${esc(p.role)}</textarea></label><label>Tags (comma separated)<input name="tags" value="${esc(p.tags.join(', '))}"></label><label>Artifact links (one “label | https://…” per line)<textarea name="links" id="edit-links" rows="4"></textarea></label><h3>Media</h3><p>Images, PDFs, MP4, or WebM · up to 10 MB per file. Uploads are added to this project when you apply and save.</p><input type="file" id="project-upload" multiple accept="image/png,image/jpeg,image/webp,image/gif,application/pdf,video/mp4,video/webm" aria-label="Upload project files"><p id="upload-status" role="status"></p><div id="edit-media"></div><p id="edit-error" role="alert"></p><div class="edit-actions"><button type="button" data-cancel-edit>cancel</button><button id="apply-content" type="submit">apply to draft</button></div></form>`;
    gallery();
    contentDialog.querySelector('#edit-links').value=Object.entries(editingDraft.links).map(([label,url])=>label+' | '+url).join('\n');
    contentDialog.showModal();
    contentDialog.querySelector('#project-upload').addEventListener('change',async e=>{
      const apply=contentDialog.querySelector('#apply-content'),info=contentDialog.querySelector('#upload-status');apply.disabled=true;
      // Keep manually edited links when an upload adds another artifact.
      try{editingDraft.links=parseLinks(contentDialog.querySelector('#edit-links').value);}catch(error){info.textContent=error.message;apply.disabled=false;return;}
      for(const file of e.target.files){
        try{
          if(file.size>10*1024*1024)throw new Error(file.name+': keep files under 10 MB.');
          info.textContent='Uploading '+file.name+'…';
          const result=await request('/admin/upload',{method:'POST',headers:{'Content-Type':file.type || 'application/octet-stream'},body:file});
          if(result.type.startsWith('image/')){editingDraft.images.push(result.url);if(!editingDraft.coverImage)editingDraft.coverImage=result.url;}
          else if(result.type.startsWith('video/'))editingDraft.video=result.url;
          else{let label='PDF',n=2;while(editingDraft.links[label])label='PDF '+n++;editingDraft.links[label]=result.url;}
          gallery();
    contentDialog.querySelector('#edit-links').value=Object.entries(editingDraft.links).map(([label,url])=>label+' | '+url).join('\n');
          info.textContent='Uploaded '+file.name+'. Apply to draft, then save changes.';
        }catch(error){info.textContent=error.message;break;}
      }
      apply.disabled=false;e.target.value='';
    });
    contentDialog.querySelector('form').addEventListener('submit',e=>{
      e.preventDefault();const form=e.target;
      try{
        const content={};for(const field of ['title','description','detail','role','context','yearLabel'])content[field]=form.elements[field].value;
        content.tags=form.elements.tags.value.split(',').map(t=>t.trim()).filter(Boolean);
        content.links=parseLinks(form.elements.links.value);content.images=editingDraft.images;content.coverImage=editingDraft.coverImage || '';content.video=editingDraft.video || '';
        settings.projects[id].content=content;changed();renderRows();contentDialog.close();
      }catch(error){contentDialog.querySelector('#edit-error').textContent=error.message;}
    });
  }
  function parseLinks(text){
    const links={};for(const line of text.split('\n').filter(l=>l.trim())){const i=line.indexOf('|');if(i<1)throw new Error('Use one label | URL per line.');const label=line.slice(0,i).trim(),url=line.slice(i+1).trim();if(!/^https:\/\//i.test(url)&&!url.startsWith('assets/projects/'))throw new Error('Links must start with https://.');links[label]=url;}return links;
  }
  contentDialog.addEventListener('click',e=>{
    if(e.target.hasAttribute('data-cancel-edit'))contentDialog.close();
    if(e.target.hasAttribute('data-cover')){editingDraft.coverImage=editingDraft.images[Number(e.target.dataset.cover)];gallery();}
    if(e.target.hasAttribute('data-remove')){const [removed]=editingDraft.images.splice(Number(e.target.dataset.remove),1);if(editingDraft.coverImage===removed)editingDraft.coverImage=editingDraft.images[0] || '';gallery();}
  });

  function renderRows(){
    const q=document.querySelector('#editor-search').value.toLowerCase().trim();
    const group=document.querySelector('#editor-group').value;
    const list=projects.map(projectValue).filter(p=>!p.hiddenFromAll && (!group || p.group===group) && (!q || [p.title,p.context,p.yearLabel,...p.tags].join(' ').toLowerCase().includes(q)));
    document.querySelector('#editor-count').textContent=`${list.length} projects`;
    document.querySelector('#project-rows').innerHTML=list.map(p=>{
      const display=settings.projects[p.id],image=p.coverImage || p.images[0];
      const src=image?.startsWith('assets/projects/')?`${api}/${image}`:image;
      return `<tr data-id="${esc(p.id)}"><td><div class="project-cell">${src?`<img src="${esc(src)}" alt="" loading="lazy">`:''}<div><strong>${esc(p.title)}</strong><button class="edit-project" type="button" data-edit="${esc(p.id)}">edit text & media</button><small>${esc(p.yearLabel)} · ${esc(names[p.group] || p.group)}</small></div></div></td>${['overview','design','engineering'].map(v=>`<td><div class="placement"><input type="checkbox" data-view="${v}" aria-label="Show ${esc(p.title)} in ${v}" ${display.views.includes(v)?'checked':''}><button class="star" data-star="${v}" aria-label="Select ${esc(p.title)} for featured ${v} work" aria-pressed="${display.selectedViews.includes(v)}" ${display.views.includes(v)?'':'disabled'}>${display.selectedViews.includes(v)?'★':'☆'}</button></div></td>`).join('')}<td><select class="access-select" aria-label="Access for ${esc(p.title)}">${[['inherit','section default'],['public','public'],['password','password']].map(([v,label])=>`<option value="${v}" ${display.access===v?'selected':''}>${label}</option>`).join('')}</select><span class="access-result">${locked(p)?'🔒 password protected':'public'}</span></td><td><button class="all-only" data-all-only aria-pressed="${!display.views.length}">all work only</button></td></tr>`;
    }).join('');
  }
  function render(){
    signout.hidden=false;
    const groups=[...new Set(projects.map(p=>p.group))];
    editor.innerHTML=`<div class="save-bar"><p id="save-summary" class="counts"></p><div class="save-actions"><button id="export-settings">export settings</button><button id="save-settings" disabled>save changes</button></div></div><section class="section-access"><h2>Section access</h2><p>Checked sections require the viewer password by default. Individual project access can override that default.</p><div class="section-locks">${groups.map(g=>`<label><input type="checkbox" data-lock="${esc(g)}" ${settings.lockedGroups.includes(g)?'checked':''}>🔒 ${esc(names[g] || g)}</label>`).join('')}</div><p class="help">Nothing becomes public until you change access and save. Artwork/PDF links remain shareable; portfolio pages stay out of search results.</p></section><h2>Project placement</h2><button type="button" id="new-project">+ new project</button><p>Tick a view to include a project. Use ★ to put it in that view’s selected row. “All work only” removes it from every focused view.</p><div class="editor-toolbar"><input type="search" id="editor-search" placeholder="Find a project…" aria-label="Search projects"><select id="editor-group" aria-label="Filter sections"><option value="">all sections</option>${groups.map(g=>`<option value="${esc(g)}">${esc(names[g] || g)}</option>`).join('')}</select><span id="editor-count"></span></div><div class="project-table"><table><thead><tr><th>project</th><th>overview ★</th><th>design ★</th><th>engineering ★</th><th>access</th><th>placement</th></tr></thead><tbody id="project-rows"></tbody></table></div>`;
    renderRows();summary();
    document.querySelector('#new-project').addEventListener('click',()=>{
      if(dirty){status.textContent='Save your current changes before adding a new project.';return;}
      const selectedGroup=document.querySelector('#editor-group').value || 'personal';
      contentDialog.innerHTML=`<form id="new-project-form"><div class="edit-top"><h2>New project</h2><button type="button" data-cancel-edit>close ×</button></div><label>Project title<input name="title" required maxlength="200"></label><label>Section<select name="group">${groups.map(g=>`<option value="${esc(g)}" ${g===selectedGroup?'selected':''}>${esc(names[g] || g)}</option>`).join('')}</select></label><p>New projects start password protected and in all work only.</p><p id="new-error" role="alert"></p><div class="edit-actions"><button type="submit">create project →</button></div></form>`;
      contentDialog.showModal();
      contentDialog.querySelector('form').addEventListener('submit',async e=>{
        e.preventDefault();const button=e.target.querySelector('[type=submit]');button.disabled=true;
        try{const result=await request('/admin/projects',{method:'POST',body:JSON.stringify({title:e.target.elements.title.value,group:e.target.elements.group.value})});projects=result.projects;settings=result.settings;contentDialog.close();render();editProject(result.id);status.textContent='New project created, password protected and in all work only.';}catch(error){contentDialog.querySelector('#new-error').textContent=error.message;button.disabled=false;}
      });
    });
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
    const edit=e.target.closest('[data-edit]');if(edit){editProject(edit.dataset.edit);return;}
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
