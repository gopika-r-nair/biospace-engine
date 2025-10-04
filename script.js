// Navigation
const links = document.querySelectorAll('#sidebar a');
const pages = document.querySelectorAll('.page');

links.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const pageId = link.getAttribute('data-page');
    pages.forEach(p => p.classList.remove('active'));
    document.getElementById(pageId + '-page').classList.add('active');
  });
});

// Publications CSV fetch
async function loadPublications() {
  const container = document.getElementById('publications-data-table');
  try {
    const res = await fetch("https://raw.githubusercontent.com/gopika-r-nair/biospace-engine/main/publications_pmc.csv");
    const text = await res.text();
    const rows = text.split("\n").map(r => r.split(","));
    let html = "<table border='1'><tr>";
    rows[0].forEach(h => html += `<th>${h}</th>`);
    html += "</tr>";
    rows.slice(1).forEach(r => {
      if(r.length > 1) {
        html += "<tr>" + r.map(c => `<td>${c}</td>`).join("") + "</tr>";
      }
    });
    html += "</table>";
    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = "Error loading publications.";
  }
}
loadPublications();

// Chatbot
const chatbotToggle = document.getElementById('chatbot-toggle');
const chatbot = document.getElementById('chatbot-container');
const closeChat = document.getElementById('close-chatbot');

chatbotToggle.onclick = () => chatbot.classList.toggle('hidden');
closeChat.onclick = () => chatbot.classList.add('hidden');

// Settings modal
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettings = document.getElementById('close-settings');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

settingsBtn.onclick = () => settingsModal.classList.remove('hidden');
closeSettings.onclick = () => settingsModal.classList.add('hidden');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.getAttribute('data-tab');
    tabContents.forEach(tc => tc.classList.remove('active'));
    document.getElementById(tab).classList.add('active');
  });
});
