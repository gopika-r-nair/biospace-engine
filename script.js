// **CORRECTED CSV URL from your GitHub repository**
const CSV_URL = 'https://raw.githubusercontent.com/gopika-n-nair/biospace-engine/main/publications_pmc.csv'; 

// Global variables
let allPublications = []; 
let currentTag = 'all'; 
let selectedUserType = null; // Variable to track the selected user card

// User data for the graph (placeholder data)
const USER_TYPES = {
    'Scientist': { label: 'Sci', color: '#ffc107', count: 120 },
    'Manager': { label: 'Mngr', color: '#17a2b8', count: 80 },
    'Mission Architect': { label: 'Arch', color: '#dc3545', count: 50 },
    'Visitor': { label: 'Visit', color: '#28a745', count: 150 }
};
let currentUserType = 'None'; 


// ---------------------------------
// Core Application Functions
// ---------------------------------

function navigateTo(pageId) {
    if (pageId === 'user-selection-page') {
        document.getElementById('user-selection-page').style.display = 'flex';
        document.getElementById('user-selection-page').classList.add('active');
        document.getElementById('main-application').style.display = 'none';
        return;
    }

    document.querySelectorAll('.portal-page').forEach(page => {
        page.classList.remove('active');
    });

    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        if (pageId === 'publications-page') {
            loadPublicationsData(); 
        }
    }
}

function setupNavigation() {
    // Nav links and back buttons
    document.querySelectorAll('[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPageId = e.currentTarget.getAttribute('data-page');
            navigateTo(targetPageId);
        });
    });

    // Tag filter handlers 
    document.querySelectorAll('.tag-button').forEach(button => {
        button.addEventListener('click', (e) => {
            currentTag = e.target.getAttribute('data-tag');
            document.querySelectorAll('.tag-button').forEach(btn => btn.classList.remove('active-tag'));
            e.target.classList.add('active-tag');
            filterPublications();
        });
    });
}

function setupUserSelectionHandlers() {
     const continueBtn = document.getElementById('continue-btn');
     
     // 1. Handle card clicks (selection logic)
     document.querySelectorAll('.user-type-card').forEach(card => {
        card.addEventListener('click', (e) => {
            // Remove 'selected' class from all cards
            document.querySelectorAll('.user-type-card').forEach(c => c.classList.remove('selected'));
            
            // Add 'selected' class to the clicked card
            e.currentTarget.classList.add('selected');
            
            // Set the selected type and enable the continue button
            selectedUserType = e.currentTarget.getAttribute('data-type');
            continueBtn.disabled = false;
        });
    });
    
    // 2. Handle continue button click (transition logic)
    continueBtn.addEventListener('click', () => {
        if (selectedUserType) {
            handleUserSelection(selectedUserType);
        }
    });
}


// ---------------------------------
// User Selection & Graph Functions
// ---------------------------------

function handleUserSelection(type) {
    currentUserType = type;
    
    document.getElementById('current-user-type').textContent = `Profile: ${type}`;
    
    document.getElementById('user-selection-page').classList.remove('active');
    document.getElementById('user-selection-page').style.display = 'none';
    document.getElementById('main-application').style.display = 'block';

    if (USER_TYPES[type]) {
        USER_TYPES[type].count += 1;
    }
    renderUserTypeGraph();

    navigateTo('home-page');
}

function renderUserTypeGraph() {
    const graphContainer = document.getElementById('user-type-graph');
    if (!graphContainer) return;

    graphContainer.innerHTML = '';
    
    const totalUsers = Object.values(USER_TYPES).reduce((sum, user) => sum + user.count, 0);

    for (const type in USER_TYPES) {
        const user = USER_TYPES[type];
        const percentage = (user.count / totalUsers) * 100;
        
        const segment = document.createElement('div');
        segment.classList.add('graph-segment');
        segment.style.width = `${percentage}%`;
        segment.style.backgroundColor = user.color;
        segment.title = `${type}: ${user.count} users (${percentage.toFixed(1)}%)`;
        
        graphContainer.appendChild(segment);
    }
}


// ---------------------------------
// Chatbot Functions
// ---------------------------------

function toggleChat(show) {
    const chatWindow = document.getElementById('chat-window');
    const chatIcon = document.getElementById('chat-icon');
    
    if (show) {
        chatWindow.style.display = 'flex';
        chatIcon.style.display = 'none';
    } else {
        chatWindow.style.display = 'none';
        chatIcon.style.display = 'flex';
    }
}

function sendMessage(message) {
    const chatBody = document.getElementById('chat-body');
    const userMessage = document.createElement('div');
    userMessage.classList.add('chat-message', 'user');
    userMessage.textContent = message;
    chatBody.appendChild(userMessage);

    chatBody.scrollTop = chatBody.scrollHeight; 

    setTimeout(() => {
        let botResponse = `I see you are logged in as a **${currentUserType}**. I'm currently summarizing that: ${message}`;
        
        if (message.toLowerCase().includes('latest publication')) {
            botResponse = 'The latest publication is loading from your CSV data. Check the Publications tab for real-time updates!';
        } else if (message.toLowerCase().includes('submit')) {
            botResponse = 'To submit a publication, please navigate to the Publications tab and click the "Submit a new publication" link. ';
        } else if (message.toLowerCase().includes('challenge')) {
            botResponse = 'The EXBIO Portal is built for the NASA Space Apps Challenge 2025: "Build a Space Biology Knowledge Engine".';
        }

        const botMsg = document.createElement('div');
        botMsg.classList.add('chat-message', 'bot');
        botMsg.innerHTML = botResponse; 
        chatBody.appendChild(botMsg);
        
        chatBody.scrollTop = chatBody.scrollHeight; 
    }, 800);
}

function handleChatInput(e) {
    if (e.key === 'Enter') {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        if (message) {
            sendMessage(message);
            input.value = '';
        }
    }
}

function sendChatOption(option) {
    sendMessage(option);
}

// ---------------------------------
// Publications Data Handling
// ---------------------------------

async function fetchPublications() {
    try {
        const response = await fetch(CSV_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const csvText = await response.text();
        return parseCSV(csvText);
    } catch (error) {
        console.error("Could not fetch or parse publications data:", error);
        document.getElementById('publications-dashboard').innerHTML = 
            `<p style="color: red;">Error loading publications from GitHub. Showing **placeholder data** instead.</p>`;
        return getPlaceholderPublications();
    }
}

function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length === 0) return [];
    
    // Simple header extraction
    const headers = lines[0].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(h => h.trim().replace(/"/g, '').toLowerCase().replace(/ /g, '_'));
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().replace(/"/g, '')); 
        if (values.length === headers.length) {
            let item = {};
            headers.forEach((header, index) => {
                item[header] = values[index];
            });
            data.push(item);
        }
    }
    return data;
}

function getPlaceholderPublications() {
    return [
        { title: "AI-Driven Plant Stress Detection in Microgravity", summary: "Machine learning for plant stress detection.", authors: "Dr. A. Smith, J. Lee", tags: "Artificial Intelligence & Machine Learning, Flora & Fauna", link: "#" },
        { title: "Optimizing Data Management for Bioscience Experiments on ISS", summary: "New standardized format for biological data.", authors: "R. Kaur, S. Chen", tags: "Data Management, Software", link: "#" },
        { title: "Educational Outreach: Bringing Space Biology to K-12", summary: "Curriculum development and interactive tools for students.", authors: "M. Johnson", tags: "Education, Writing & Communications", link: "#" }
    ];
}

function loadPublicationsData() {
    if (allPublications.length === 0) {
        fetchPublications().then(data => {
            allPublications = data;
            filterPublications();
        });
    } else {
        filterPublications();
    }
}

function filterPublications() {
    const dashboard = document.getElementById('publications-dashboard');
    const searchInput = document.getElementById('search-publications').value.toLowerCase();

    const filtered = allPublications.filter(pub => {
        const pubTags = pub.tags ? pub.tags : ''; 
        const tagMatch = currentTag === 'all' || pubTags.includes(currentTag);
        
        const searchMatch = !searchInput || 
            (pub.title && pub.title.toLowerCase().includes(searchInput)) ||
            (pub.summary && pub.summary.toLowerCase().includes(searchInput)) ||
            (pub.authors && pub.authors.toLowerCase().includes(searchInput));

        return tagMatch && searchMatch;
    });

    displayPublications(filtered, dashboard);
}

function displayPublications(publications, container) {
    container.innerHTML = ''; 

    if (publications.length === 0) {
        container.innerHTML = '<p>No publications found matching your criteria. Try adjusting the search or filters.</p>';
        return;
    }

    publications.forEach(pub => {
        const card = document.createElement('div');
        card.classList.add('publication-card');

        card.innerHTML = `
            <h3>${pub.title || 'No Title'}</h3>
            <p class="author">${pub.authors || 'Unknown Author'}</p>
            <p class="summary">${pub.summary || 'No summary available.'}</p>
            <p class="tags">Tags: ${pub.tags || 'General'}</p>
            <a href="${pub.link || '#'}" target="_blank">View Details (Link)</a>
        `;
        container.appendChild(card);
    });
}


// ---------------------------------
// Initialization
// ---------------------------------

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial Setup
    setupUserSelectionHandlers(); 
    setupNavigation();
    renderUserTypeGraph(); 
    
    // 2. Ensure only the selection screen is visible initially
    navigateTo('user-selection-page');

    // 3. Pre-load data in the background 
    if (allPublications.length === 0) {
        fetchPublications().then(data => {
            allPublications = data;
        });
    }
});
