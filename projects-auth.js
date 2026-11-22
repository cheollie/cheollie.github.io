(() => {
  'use strict';
  const catalog = document.querySelector('#catalog');
  const tabs = document.querySelector('.portfolio-tabs');
  const local = ['localhost','127.0.0.1'].includes(location.hostname);
  const api = (window.PORTFOLIO_API_URL || (local ? 'http://127.0.0.1:8787' : '/portfolio-api')).replace(/\/$/,'');
  const sessionKey = 'portfolio-session-v1';
  tabs.hidden = true;
  let session;
  try { session = sessionStorage.getItem(sessionKey); } catch {}
  const save = value => { session=value; try { if(value) sessionStorage.setItem(sessionKey,value); else sessionStorage.removeItem(sessionKey); } catch {} };
  function gate(message='') {
    catalog.innerHTML = `<form class="portfolio-gate"><div class="portfolio-password-row"><input id="portfolio-password" aria-label="Portfolio password" placeholder="Password" name="password" type="password" autocomplete="current-password" required maxlength="512"><button type="submit">view portfolio →</button></div><p role="status" class="portfolio-auth-status"></p></form>`;
    const form = catalog.querySelector('form');
    form.querySelector('[role="status"]').textContent = message;
    form.addEventListener('submit',async e => {
      e.preventDefault();
      const button=form.querySelector('button');
      button.disabled=true;
      const status=form.querySelector('[role="status"]');
      status.textContent='Opening the collection…';
      try {
        const res=await fetch(`${api}/login`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:form.elements.password.value})});
        if(res.status===404 || res.status===503) throw new Error('The portfolio is not connected yet. Please try again later.');
        const result=await res.json();
        if(!res.ok) throw new Error(result.error || 'Couldn’t open the portfolio.');
        save(result.token);
        form.reset();
        await load();
      } catch(error) {status.textContent=error instanceof TypeError ? 'Couldn’t connect. Please try again shortly.' : error.message;button.disabled=false;}
    });
  }
  async function load() {
    const res=await fetch(`${api}/catalog`,{headers:{Authorization:`Bearer ${session}`},cache:'no-store'});
    if(res.status===401) {save(null);gate('Please enter the password to continue.');return;}
    if(!res.ok) throw new Error('Couldn’t load the collection. Please try again.');
    const data=await res.json();
    if(!Array.isArray(data)) throw new Error('Couldn’t load the collection.');
    // Relative artwork paths resolve to the API host, not the public GitHub repo.
    function assets(value) {
      if(typeof value==='string' && value.startsWith('assets/projects/')) return `${api}/${value}`;
      if(Array.isArray(value)) return value.map(assets);
      if(value && typeof value==='object') return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,assets(v)]));
      return value;
    }
    window.PORTFOLIO_PROJECTS=data.map(assets);
    const script=document.createElement('script');script.src='projects.js';
    script.onerror=()=>{tabs.hidden=true;gate('Couldn’t open the collection. Please refresh and try again.');};
    script.onload=()=>{const button=document.createElement('button');button.type='button';button.className='portfolio-lock';button.textContent='lock portfolio';button.addEventListener('click',()=>{save(null);location.reload();});document.querySelector('.portfolio-intro').append(button);};
    document.body.append(script);
    tabs.hidden=false;
  }
  if(session) load().catch(()=>gate('Couldn’t reconnect. Enter the password to try again.'));else gate();
})();
