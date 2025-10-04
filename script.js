// **CSV URL from your GitHub repository**
const CSV_URL = 'https://raw.githubusercontent.com/gopika-n-nair/biospace-engine/main/publications_pmc.csv';

// Global State (Equivalent to Streamlit's st.session_state)
let appState = {
    userRole: null,
    currentPage: 'about-page',
    pubsSubsection: 'Search Publications',
    careerSubsection: 'Life at NASA',
    activitiesSubsection: 'Quiz',
    chatHistory: [{ role: "bot", content: "Hello! I'm your NASA Space Life Sciences chatbot. How can I help you today?" }],
    allPublications: [],
    projects: [
        { title: "Microgravity Effects on Cells", desc: "This project investigates the fundamental changes in cell structure and function in a microgravity environment, with potential applications for biomedical research on Earth.", year: 2022, impact: "Biomedical research & drug development" },
        { title: "Radiation Impact on Tissue", desc: "A long-term study to understand how cosmic radiation affects human tissue, aiming to develop better radiation shielding and protective measures for astronauts on long-duration missions.", year: 2023, impact: "Health research for deep space missions" },
        { title: "Plant Growth Experiments on ISS", desc: "Microgravity affects plant biology in unique ways. This experiment explores how plants adapt to their environment, which is crucial for developing future food systems in space.", year: 2021, impact: "Sustainable agriculture & life support systems" }
    ]
};

// ---------------------------------
// 1. Core Navigation and Setup
// ---------------------------------

function navigateTo(pageId) {
    if (pageId === appState.currentPage) return;

    // 1. Hide all pages
    document.querySelectorAll('.portal-page').forEach(page => {
        page.classList.remove('active');
    });

    // 2. Show the target page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        appState.currentPage = pageId;
    }
    
    // 3. Update active tab style
    document.querySelectorAll('.main-nav-tabs a').forEach(a => a.classList.remove('active-tab'));
    document.querySelector(`.main-nav-tabs a[data-page="${pageId}"]`).classList.add('active-tab');
    
    // 4. Load specific content if needed
    if (pageId === 'publications-page') {
        renderPublicationsSubView(appState.pubsSubsection);
    } else if (pageId === 'activities-page') {
        renderActivitiesSubView(appState.activitiesSubsection);
    } else if (pageId === 'career-page') {
        renderCareerSubView(appState.careerSubsection);
    }
}

function setupNavigation() {
    // Tab navigation links
    document.querySelectorAll('.main-nav-tabs a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(e.currentTarget.getAttribute('data-page'));
        });
    });

    // Sub-navigation buttons (Publications)
    document.querySelectorAll('.pub-sub-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const sub = e.target.getAttribute('data-sub');
            appState.pubsSubsection = sub;
            renderPublicationsSubView(sub);
        });
    });

    // Sub-navigation buttons (Activities)
    document.querySelectorAll('.activity-sub-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const sub = e.target.getAttribute('data-sub');
            appState.activitiesSubsection = sub;
            renderActivitiesSubView(sub);
        });
    });

    // Sub-navigation buttons (Career)
    document.querySelectorAll('.career-sub-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const sub = e.target.getAttribute('data-sub');
            appState.careerSubsection = sub;
            renderCareerSubView(sub);
        });
    });
}

function setupProjectsPage() {
    const list = document.getElementById('projects-list');
    list.innerHTML = '';
    appState.projects.forEach(p => {
        const div = document.createElement('div');
        div.innerHTML = `
            <p><strong>${p.title} (${p.year})</strong></p>
            <p>${p.desc}</p>
            <p><strong>Impact:</strong> ${p.impact}</p>
            <hr>
        `;
        list.appendChild(div);
    });
}

// ---------------------------------
// 2. User Selection Logic
// ---------------------------------

function handleUserSelection(type) {
    appState.userRole = type;
    
    // Update header
    document.getElementById('current-user-type').textContent = `Role: ${type}`;
    document.getElementById('welcome-message').textContent = `Welcome, ${type}!`;
    
    // Transition to main dashboard
    document.getElementById('user-selection-page').style.display = 'none';
    document.getElementById('main-application').style.display = 'block';

    navigateTo('about-page');
}

function setupUserSelectionHandlers() {
    const continueBtn = document.getElementById('continue-btn');
     
    document.querySelectorAll('.user-type-card').forEach(card => {
        card.addEventListener('click', (e) => {
            document.querySelectorAll('.user-type-card').forEach(c => c.classList.remove('selected'));
            e.currentTarget.classList.add('selected');
            selectedUserType = e.currentTarget.getAttribute('data-type');
            continueBtn.disabled = false;
        });
    });
    
    continueBtn.addEventListener('click', () => {
        if (selectedUserType) {
            handleUserSelection(selectedUserType);
        }
    });

    // Start with only selection screen active
    document.getElementById('main-application').style.display = 'none';
    document.getElementById('user-selection-page').classList.add('active');
}

// ---------------------------------
// 3. Publications Tab (Data Handling & Rendering)
// ---------------------------------

async function loadPublications() {
    if (appState.allPublications.length > 0) return;

    try {
        const response = await fetch(CSV_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const csvText = await response.text();
        const lines = csvText.trim().split('\n');
        if (lines.length <= 1) return;

        // Custom parser to handle quotes and commas, matching Streamlit logic
        const headers = lines[0].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(h => h.trim().replace(/"/g, '').toLowerCase().replace(/ /g, '_'));
        appState.allPublications = lines.slice(1).map(line => {
            const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().replace(/"/g, ''));
            let item = {};
            headers.forEach((header, index) => {
                item[header] = values[index];
            });
            return item;
        });

        // Initial render after data load
        filterPublications(); 
        renderLatestPublications();
    } catch (error) {
        console.error("Could not fetch or parse publications data:", error);
        document.getElementById('publications-dashboard').innerHTML = '<p style="color: red;">Error loading publications from GitHub. Data display is limited.</p>';
    }
}

function filterPublications() {
    const dashboard = document.getElementById('publications-dashboard');
    const searchInput = document.getElementById('pub-search-input').value.toLowerCase();
    
    if (appState.allPublications.length === 0) {
        dashboard.innerHTML = '<p>Data not available or still loading...</p>';
        return;
    }

    const filtered = appState.allPublications.filter(pub => {
        const title = pub.title ? pub.title.toLowerCase() : '';
        const summary = pub.summary ? pub.summary.toLowerCase() : '';
        const authors = pub.authors ? pub.authors.toLowerCase() : '';

        return !searchInput || 
               title.includes(searchInput) ||
               summary.includes(searchInput) ||
               authors.includes(searchInput);
    });

    displayPublicationsTable(filtered, dashboard);
}

function renderLatestPublications() {
    const dashboard = document.getElementById('latest-publications-list');

    if (appState.allPublications.length === 0) {
        dashboard.innerHTML = '<p>Data not available or still loading...</p>';
        return;
    }
    
    // Simple sort by title for a basic "latest" effect since year column is inconsistent
    const latest = [...appState.allPublications].sort((a, b) => (b.title || '').localeCompare(a.title || '')).slice(0, 20);

    displayPublicationsTable(latest, dashboard);
}

function displayPublicationsTable(publications, container) {
    if (publications.length === 0) {
        container.innerHTML = '<p>No publications found matching your criteria.</p>';
        return;
    }

    // Build the HTML table
    let html = '<table><thead><tr><th>Title</th><th>Authors</th><th>Link</th></tr></thead><tbody>';
    publications.forEach(pub => {
        const title = pub.title || 'No Title';
        const authors = pub.authors || 'Unknown';
        const link = pub.link || pub.doi || '#';
        
        html += `
            <tr>
                <td>${title}</td>
                <td>${authors}</td>
                <td><a href="${link}" target="_blank">View</a></td>
            </tr>
        `;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
}

function renderPublicationsSubView(sub) {
    // Set active button style
    document.querySelectorAll('.pub-sub-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.pub-sub-btn[data-sub="${sub}"]`).classList.add('active');

    // Show active sub-view content
    document.querySelectorAll('#pubs-content .sub-view').forEach(view => view.classList.remove('active'));
    
    if (sub === 'Search Publications') {
        document.getElementById('pubs-search-view').classList.add('active');
        filterPublications(); // Reload the data
    } else if (sub === 'Latest Publications') {
        document.getElementById('pubs-latest-view').classList.add('active');
        renderLatestPublications(); // Reload the data
    } else if (sub === 'Submit a Publication') {
        document.getElementById('pubs-submit-view').classList.add('active');
    }
}

// ---------------------------------
// 4. Activities Tab (Quiz Logic)
// ---------------------------------

function setupQuiz() {
    document.getElementById('quiz-submit-btn').addEventListener('click', () => {
        const selected = document.querySelector('input[name="quiz1"]:checked');
        const feedback = document.getElementById('quiz-feedback');
        feedback.style.color = 'white';

        if (selected) {
            if (selected.value === "Bones lose density") {
                feedback.textContent = "Correct! Bones need gravity to maintain their density, so they weaken in space.";
                feedback.style.backgroundColor = '#4CAF50';
                feedback.style.padding = '5px';
            } else {
                feedback.textContent = "That's not it. Give it another try!";
                feedback.style.backgroundColor = '#d9534f';
                feedback.style.padding = '5px';
            }
        } else {
            feedback.textContent = "Please select an answer.";
            feedback.style.backgroundColor = 'transparent';
        }
    });
}

function renderActivitiesSubView(sub) {
    document.querySelectorAll('.activity-sub-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.activity-sub-btn[data-sub="${sub}"]`).classList.add('active');

    document.querySelectorAll('#activities-content .sub-view').forEach(view => view.classList.remove('active'));
    
    if (sub === 'Quiz') {
        document.getElementById('activity-quiz-view').classList.add('active');
    } else if (sub === 'Future Activities') {
        document.getElementById('activity-future-view').classList.add('active');
    }
}

// ---------------------------------
// 5. Career Tab
// ---------------------------------

function renderCareerSubView(sub) {
    document.querySelectorAll('.career-sub-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.career-sub-btn[data-sub="${sub}"]`).classList.add('active');

    document.querySelectorAll('#career-content .sub-view').forEach(view => view.classList.remove('active'));
    
    if (sub === 'Life at NASA') {
        document.getElementById('career-life-view').classList.add('active');
    } else if (sub === 'Career Scopes') {
        document.getElementById('career-scopes-view').classList.add('active');
    } else if (sub === 'Q&A') {
        document.getElementById('career-qna-view').classList.add('active');
    }
}

// ---------------------------------
// 6. Chatbot Logic
// ---------------------------------

function chatbotAnswer(question) {
    const q = question.toLowerCase();
    let ans = "I can provide information on key topics in space biology. Try asking about **long-term stays**, **plants**, or **radiation** in space.";
    let refs = [];

    // Search logic to mimic the Python script's chatbot_answer
    const findReferences = (keywords) => {
        if (appState.allPublications.length === 0) return [];
        const relevant = appState.allPublications.filter(pub => {
            const title = pub.title ? pub.title.toLowerCase() : '';
            return keywords.some(k => title.includes(k));
        }).slice(0, 2); 
        return relevant.map(r => ({ title: r.title || "No Title", link: r.link || r.doi || '' }));
    };

    if (q.includes("stay longer") || q.includes("long stay") || q.includes("longer in space")) {
        ans = "Staying for extended periods in space can lead to **bone demineralization** and **muscle atrophy** due to the lack of gravity. Astronauts also face increased risk from **radiation exposure** and changes to their cardiovascular system.";
        refs = findReferences(["bone density", "muscle atrophy", "radiation", "long duration"]);
    } else if (q.includes("plant") || q.includes("growth")) {
        ans = "In microgravity, plants adapt differently, affecting photosynthesis, root orientation, and growth patterns.";
        refs = findReferences(["plant growth", "microgravity", "agriculture"]);
    } else if (q.includes("radiation")) {
        ans = "Cosmic and solar radiation can damage DNA and cells, increasing the long-term health risks for astronauts, including an elevated risk of cancer.";
        refs = findReferences(["radiation", "cosmic rays", "dna damage"]);
    }

    let fullResponse = ans;
    if (refs.length > 0) {
        fullResponse += "\n\n**Related Publications:**";
        refs.forEach(r => {
            fullResponse += r.link ? `\n- [${r.title}](${r.link})` : `\n- ${r.title}`;
        });
    }

    return fullResponse;
}

function handleChatInput(e) {
    if (e.key === 'Enter') {
        const input = document.getElementById('chat-input');
        const prompt = input.value.trim();
        if (prompt) {
            // Add user message to history
            const userMsg = document.createElement('div');
            userMsg.classList.add('chat-message', 'user');
            userMsg.textContent = prompt;
            document.getElementById('chat-history').appendChild(userMsg);
            appState.chatHistory.push({ role: "user", content: prompt });

            input.value = '';

            // Scroll to bottom
            const history = document.getElementById('chat-history');
            history.scrollTop = history.scrollHeight;

            // Get bot response and simulate delay
            setTimeout(() => {
                const responseText = chatbotAnswer(prompt);
                const botMsg = document.createElement('div');
                botMsg.classList.add('chat-message', 'bot');
                // Use a basic markdown-to-HTML conversion for bold/links
                botMsg.innerHTML = responseText
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                    .replace(/\n/g, '<br>');

                document.getElementById('chat-history').appendChild(botMsg);
                appState.chatHistory.push({ role: "bot", content: responseText });

                history.scrollTop = history.scrollHeight;
            }, 800);
        }
    }
}


// ---------------------------------
// 7. Initialization
// ---------------------------------

document.addEventListener('DOMContentLoaded', () => {
    // 1. Load publications data (in the background)
    loadPublications();
    
    // 2. Set up initial user selection screen
    setupUserSelectionHandlers();
    
    // 3. Set up all navigation
    setupNavigation();
    
    // 4. Set up non-data content
    setupProjectsPage();
    setupQuiz();

    // The user must select a role before the main dashboard is shown.
    // The handleUserSelection function transitions to the main dashboard.
});
