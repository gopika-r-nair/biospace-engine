// Basic interactivity: page switching, dropdown toggles, CSV fetch + parse, chatbot, settings modal

document.addEventListener('DOMContentLoaded', () => {
  // Page routing: links with data-page
  const links = document.querySelectorAll('[data-page]');
  const pages = document.querySelectorAll('.page');

  function showPage(id){
    pages.forEach(p => p.classList.toggle('active', p.id === id + '-page'));
    // highlight nav items
    document.querySelectorAll('.nav-link, .nav-sublink').forEach(n => {
      n.classList.toggle('active', n.dataset.page === id);
    });
    // If publications page -> load CSV
    if(id === 'publications') loadPublications();
  }

  links.forEach(l=>{
    l.addEventListener('click', (e)=>{
      e.preventDefault();
      const page = l.getAttribute('data-page');
      if(page) showPage(page);
      // On small screens collapse dropdowns
    });
  });

  // Dropdown toggle buttons in sidebar
  document.querySelectorAll('.dropdown-toggle').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const name = btn.getAttribute('data-target');
      const dd = document.getElementById(name + '-dropdown');
      if(!dd) return;
      dd.style.display = dd.style.display === 'flex' ? 'none' : 'flex';
    });
  });

  // Sidebar toggle (mobile)
  const sidebarToggle = document.getElementById('sidebar-toggle');
  sidebarToggle?.addEventListener('click', ()=>{
    document.querySelector('.sidebar').classList.toggle('collapsed');
  });

  // Chatbot toggle logic
  const chatToggle = document.getElementById('chat-toggle');
  const chatbot = document.getElementById('chatbot-widget');
  const chatClose = document.getElementById('chat-close');
  const chatSend = document.getElementById('chat-send');
  const chatInput = document.getElementById('chat-input-field');
  chatToggle.addEventListener('click', ()=> {
    chatbot.classList.toggle('visible');
  });
  chatClose.addEventListener('click', ()=> chatbot.classList.remove('visible'));
  chatSend.addEventListener('click', sendChat);
  chatInput.addEventListener('keypress', (e)=> { if(e.key === 'Enter') sendChat(); });

  function sendChat(){
    const txt = chatInput.value.trim();
    if(!txt) return;
    appendChat('user', txt);
    chatInput.value = '';
    // Demo bot response: echo with canned help
    setTimeout(()=> {
      const resp = `Demo assistant: I can help locate publications. Try searching "microgravity yeast 2015" or open the Publications page.`;
      appendChat('bot', resp);
    }, 600);
  }

  function appendChat(who, text){
    const body = document.getElementById('chat-body');
    const div = document.createElement('div');
    div.className = 'chat-msg ' + (who === 'bot' ? 'bot' : 'user');
    div.textContent = text;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }

  // Settings modal
  const settingsBtn = document.getElementById('settings-btn');
  const settingsModal = document.getElementById('settings-modal');
  const settingsClose = document.getElementById('settings-close');
  const settingsCancel = document.getElementById('settings-cancel');

  settingsBtn.addEventListener('click', ()=> settingsModal.classList.remove('hidden'));
  settingsClose.addEventListener('click', ()=> settingsModal.classList.add('hidden'));
  settingsCancel.addEventListener('click', ()=> settingsModal.classList.add('hidden'));
  document.getElementById('settings-save').addEventListener('click', () => {
    // save some demo settings to localStorage
    const name = document.getElementById('setting-username').value || 'Dr. A. Smith';
    const theme = document.getElementById('setting-theme').value;
    const analytics = document.getElementById('setting-analytics').checked;
    localStorage.setItem('exbio-username', name);
    localStorage.setItem('exbio-theme', theme);
    localStorage.setItem('exbio-analytics', analytics);
    alert('Settings saved (demo).');
    settingsModal.classList.add('hidden');
    // reflect name in header
    document.querySelector('.username').textContent = name;
  });

  // Tabs inside settings
  document.querySelectorAll('.tab-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.getAttribute('data-tab');
      document.querySelectorAll('.tab-panel').forEach(panel=>{
        panel.classList.toggle('hidden', panel.id !== 'tab-' + tab);
      });
    });
  });

  // Load saved settings
  (function loadSettings(){
    const name = localStorage.getItem('exbio-username');
    if(name) document.querySelector('.username').textContent = name;
    const theme = localStorage.getItem('exbio-theme');
    if(theme && theme === 'light') document.documentElement.style.setProperty('--bg','#f5f7fb');
  })();

  // Simple submit publication demo
  document.getElementById('submit-publication-form').addEventListener('submit', e=>{
    e.preventDefault();
    const fd = new FormData(e.target);
    const title = fd.get('title');
    document.getElementById('submit-pub-msg').textContent = `Received: "${title}" (demo — not saved to CSV).`;
    e.target.reset();
  });

  // PUBLICATIONS: fetch CSV and render table
  const csvUrl = 'https://raw.githubusercontent.com/gopika-r-nair/biospace-engine/main/publications_pmc.csv';
  const pubStatus = document.getElementById('publications-status');
  const pubTableWrap = document.getElementById('publications-data-table');
  const pubSearch = document.getElementById('pub-search');
  const pubRefresh = document.getElementById('pub-refresh');

  let publications = []; // cached

  async function loadPublications(force=false){
    // If already loaded and not forced, render cached
    if(publications.length && !force){ renderPublications(publications); return; }

    pubStatus.textContent = 'Loading publications...';
    pubTableWrap.innerHTML = '';
    try{
      const resp = await fetch(csvUrl);
      if(!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const text = await resp.text();
      publications = parseCSV(text);
      pubStatus.textContent = `Loaded ${publications.length} records.`;
      renderPublications(publications);
    }catch(err){
      pubStatus.textContent = 'Error loading publications: ' + err.message;
      console.error(err);
    }
  }

  // Refresh button
  pubRefresh.addEventListener('click', ()=> loadPublications(true));
  // search filtering
  pubSearch.addEventListener('input', (e)=>{
    const q = e.target.value.trim().toLowerCase();
    if(!q) return renderPublications(publications);
    const filtered = publications.filter(r => {
      return (r.title && r.title.toLowerCase().includes(q)) ||
             (r.authors && r.authors.toLowerCase().includes(q));
    });
    renderPublications(filtered);
  });

  // naive CSV parser (handles basic quoted fields)
  function parseCSV(text){
    const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
    if(lines.length === 0) return [];
    // header
    const header = splitCSVLine(lines[0]);
    const rows = [];
    for(let i=1;i<lines.length;i++){
      const cols = splitCSVLine(lines[i]);
      if(cols.length === 0) continue;
      const obj = {};
      for(let j=0;j<header.length;j++){
        obj[header[j].trim()] = cols[j] ? cols[j].trim() : '';
      }
      rows.push(obj);
    }
    return rows;
  }

  // Splits a single CSV line, handling basic quotes
  function splitCSVLine(line){
    const result = [];
    let cur = '';
    let inQuotes = false;
    for(let i=0;i<line.length;i++){
      const ch = line[i];
      if(ch === '"' ){
        // if next is also quote, it's an escaped quote
        if(inQuotes && line[i+1] === '"'){
          cur += '"'; i++; continue;
        }
        inQuotes = !inQuotes; continue;
      }
      if(ch === ',' && !inQuotes){
        result.push(cur); cur = ''; continue;
      }
      cur += ch;
    }
    result.push(cur);
    return result;
  }

  function renderPublications(rows){
    pubTableWrap.innerHTML = '';
    if(!rows || rows.length === 0){
      pubTableWrap.innerHTML = '<div class="status">No publications to show.</div>'; return;
    }

    // Choose columns to show if available
    const keys = Object.keys(rows[0]);
    // prefer Title, Authors, Year, Link if present (case-insensitive)
    const prefer = ['title','authors','year','link','journal'];
    const cols = [];
    prefer.forEach(p=>{
      const k = keys.find(h=>h.toLowerCase()===p);
      if(k) cols.push(k);
    });
    // add rest
    keys.forEach(k=>{ if(!cols.includes(k)) cols.push(k); });

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const thr = document.createElement('tr');
    cols.forEach(c=> {
      const th = document.createElement('th');
      th.textContent = c;
      thr.appendChild(th);
    });
    thead.appendChild(thr);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    rows.forEach(r=>{
      const tr = document.createElement('tr');
      cols.forEach(c=>{
        const td = document.createElement('td');
        let val = r[c] || '';
        // if it looks like a URL, show anchor
        if(val && (val.startsWith('http://') || val.startsWith('https://'))){
          const a = document.createElement('a'); a.href = val; a.target = '_blank'; a.rel='noopener';
          a.textContent = val.length > 60 ? val.slice(0,60) + '…' : val;
          td.appendChild(a);
        } else {
          td.textContent = val;
        }
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    pubTableWrap.appendChild(table);
  }

  // On first load show about page
  showPage('about');
});
