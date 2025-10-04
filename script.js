document.addEventListener('DOMContentLoaded', () => {
  // Page switching
  const links = document.querySelectorAll('[data-page]');
  const pages = document.querySelectorAll('.page');

  function showPage(id) {
    pages.forEach(p => p.classList.toggle('active', p.id === id + '-page'));
    document.querySelectorAll('.nav-link, .nav-sublink').forEach(n => {
      n.classList.toggle('active', n.dataset.page === id);
    });
    // If publications page then load
    if (id === 'publications') loadPublications();
  }

  links.forEach(l => {
    l.addEventListener('click', e => {
      e.preventDefault();
      const pg = l.getAttribute('data-page');
      if (pg) showPage(pg);
    });
  });

  document.querySelectorAll('.dropdown-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.getAttribute('data-target');
      const dd = document.getElementById(name + '-dropdown');
      if (!dd) return;
      dd.style.display = dd.style.display === 'flex' ? 'none' : 'flex';
    });
  });

  // Sidebar toggle (mobile)
  const sidebarToggle = document.getElementById('sidebar-toggle');
  sidebarToggle?.addEventListener('click', () => {
    document.querySelector('.sidebar').classList.toggle('collapsed');
  });

  // Chatbot toggle & logic
  const chatToggle = document.getElementById('chatbot-toggle');
  const chatbot = document.getElementById('chatbot-container');
  const chatClose = document.getElementById('chat-close');
  const chatSend = document.getElementById('chat-send');
  const chatInput = document.getElementById('chat-input-field');

  chatToggle.addEventListener('click', () => {
    chatbot.classList.toggle('hidden');
  });
  chatClose.addEventListener('click', () => {
    chatbot.classList.add('hidden');
  });
  chatSend.addEventListener('click', sendChat);
  chatInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') sendChat();
  });

  function sendChat() {
    const txt = chatInput.value.trim();
    if (!txt) return;
    appendChat('user', txt);
    chatInput.value = '';
    setTimeout(() => {
      appendChat('bot', 'Demo: I’m here to help with space biology queries.');
    }, 600);
  }

  function appendChat(who, text) {
    const body = document.getElementById('chat-body');
    const div = document.createElement('div');
    div.className = 'chat-msg ' + (who === 'bot' ? 'bot' : 'user');
    div.textContent = text;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }

  // Login / Logout simulation
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const userDisplay = document.getElementById('user-display');

  loginBtn.onclick = () => {
    const name = prompt("Enter your name (for demo):");
    if (name) {
      userDisplay.textContent = name;
      loginBtn.classList.add('hidden');
      logoutBtn.classList.remove('hidden');
    }
  };
  logoutBtn.onclick = () => {
    userDisplay.textContent = "Not logged in";
    loginBtn.classList.remove('hidden');
    logoutBtn.classList.add('hidden');
  };

  // Publications: fetch & render CSV
  const csvUrl = 'https://raw.githubusercontent.com/gopika-r-nair/biospace-engine/main/publications_pmc.csv';
  const pubStatus = document.getElementById('publications-status');
  const pubTableWrap = document.getElementById('publications-data-table');

  let publications = [];

  async function loadPublications(force = false) {
    if (publications.length && !force) {
      renderPublications(publications);
      return;
    }
    pubStatus.textContent = 'Loading publications...';
    pubTableWrap.innerHTML = '';
    try {
      const resp = await fetch(csvUrl);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const text = await resp.text();
      publications = parseCSV(text);
      pubStatus.textContent = `Loaded ${publications.length} records.`;
      renderPublications(publications);
    } catch (err) {
      pubStatus.textContent = 'Error loading publications: ' + err.message;
      console.error(err);
    }
  }

  function parseCSV(text) {
    const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
    if (lines.length === 0) return [];
    const header = splitCSVLine(lines[0]);
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = splitCSVLine(lines[i]);
      if (cols.length === 0) continue;
      const obj = {};
      for (let j = 0; j < header.length; j++) {
        obj[header[j].trim()] = cols[j] ? cols[j].trim() : '';
      }
      rows.push(obj);
    }
    return rows;
  }
  function splitCSVLine(line) {
    const result = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i+1] === '"') {
          cur += '"';
          i++;
          continue;
        }
        inQuotes = !inQuotes;
        continue;
      }
      if (ch === ',' && !inQuotes) {
        result.push(cur);
        cur = '';
        continue;
      }
      cur += ch;
    }
    result.push(cur);
    return result;
  }

  function renderPublications(rows) {
    pubTableWrap.innerHTML = '';
    if (!rows || rows.length === 0) {
      pubTableWrap.innerHTML = '<div class="status">No publications to show.</div>';
      return;
    }
    const keys = Object.keys(rows[0]);
    const prefer = ['title', 'authors', 'year', 'link', 'journal'];
    const cols = [];
    prefer.forEach(p => {
      const k = keys.find(h => h.toLowerCase() === p);
      if (k) cols.push(k);
    });
    keys.forEach(k => {
      if (!cols.includes(k)) cols.push(k);
    });

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const thr = document.createElement('tr');
    cols.forEach(c => {
      const th = document.createElement('th');
      th.textContent = c;
      thr.appendChild(th);
    });
    thead.appendChild(thr);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    rows.forEach(r => {
      const tr = document.createElement('tr');
      cols.forEach(c => {
        const td = document.createElement('td');
        let val = r[c] || '';
        if (val.startsWith('http://') || val.startsWith('https://')) {
          const a = document.createElement('a');
          a.href = val;
          a.target = '_blank';
          a.rel = 'noopener';
          a.textContent = val.length > 60 ? val.slice(0, 60) + '…' : val;
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

  // Interactive demo logic
  const expTheme = document.getElementById('exp-theme');
  const expDisplay = document.getElementById('exp-display');
  expTheme.addEventListener('change', () => {
    const val = expTheme.value;
    if (!val) {
      expDisplay.innerHTML = '<p>Select a theme above to see experiment ideas.</p>';
      return;
    }
    let content = '';
    if (val === 'microgravity') {
      content = `<p><strong>Microgravity Effects:</strong> Study how human cells, muscle, or bone respond to low gravity aboard the ISS or in clinostats.</p>`;
    } else if (val === 'radiation') {
      content = `<p><strong>Radiation Biology:</strong> Explore how cosmic radiation affects DNA repair in microbes or human cells.</p>`;
    } else if (val === 'plant') {
      content = `<p><strong>Plant Growth in Space:</strong> Investigate plant root growth, phototropism, and gene expression in microgravity.</p>`;
    }
    expDisplay.innerHTML = content;
  });

  // Initialize to show “Announcements” by default
  showPage('announcements');
});
