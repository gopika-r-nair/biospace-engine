// **IMPORTANT: REPLACE THIS WITH THE RAW URL OF YOUR CSV FILE ON GITHUB!**
const CSV_URL = 'https://raw.githubusercontent.com/YourUsername/YourRepo/main/publications_pmc.csv'; 

// Global variables
let allPublications = []; 
let currentTag = 'all'; 

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

/**
 * Utility function to switch the active page/section.
 */
function navigateTo(pageId) {
    if (pageId === 'user-selection-page') {
        // We only allow navigation to the user selection page on logout/initial load
        document.getElementById('user-selection-page').classList.add('active');
        document.getElementById('main-application').style.display = 'none';
        return;
    }

    // Hide all pages
    document.querySelectorAll('.portal-page').forEach(page => {
        page.classList.remove('active');
    });

    // Show the target page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        if (pageId === 'publications-page') {
            loadPublicationsData();
        }
    }
}

/**
 * Initializes the navigation handlers.
 */
function setupNavigation() {
    // Nav links and back buttons
    document.querySelectorAll('[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPageId = e.currentTarget.getAttribute('data-page');
            navigateTo(targetPageId);
        });
    });

    // User Type Selection Handlers
    document.querySelectorAll('.user-type-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const userType = e.currentTarget.getAttribute('data-type');
            handleUserSelection(userType);
        });
    });
}

// ---------------------------------
// User Selection & Graph Functions
// ---------------------------------

/**
 * Handles the user's initial selection, updates the graph, and loads the main app.
 */
function handleUserSelection(type) {
    currentUserType = type;
    
    // 1. Update persistent user type display
    document.getElementById('current-user-type').textContent = `User Profile: ${type}`;
    
    // 2. Hide the selection page and show the main application
    document.getElementById('user-selection-page').classList.remove('active');
    document.getElementById('user-selection-page').style.display = 'none';
    document.getElementById('main-application').style.display = 'block';

    // 3. Update the graph data (simulate one more user of the chosen type)
    USER_TYPES[type].count += 1;
    renderUserTypeGraph();

    // 4. Navigate to the main portal page
    navigateTo('home-page');
}

/**
 * Renders the stacked bar graph of user type distribution.
 */
function renderUserTypeGraph() {
    const graphContainer = document.getElementById('user-type-graph');
    graphContainer.innerHTML = '';
    
    const totalUsers = Object.values(USER_TYPES).reduce((sum, user) => sum + user.count, 0);

    // Create a segment for each user type
    for (const type in USER_TYPES) {
        const user = USER_TYPES[type];
        const percentage = (user.count / totalUsers) * 100;
        
        const segment = document.createElement('div');
        segment.classList.add('graph-segment');
        segment.style.width = `${percentage}%`;
        segment.style.backgroundColor = user.color;
        
        // Add a tooltip for details
        segment.title = `${type}: ${user.count} users (${percentage.toFixed(1)}%)`;
        
        graphContainer.appendChild(segment);
    }
}


// ---------------------------------
// Chatbot Functions
// ---------------------------------

/**
 * Toggles the visibility of the chat window.
 */
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

/**
 * Sends a message from the user (either typed or chosen option).
 */
function sendMessage(message) {
    const chatBody = document.getElementById('chat-body');
    const userMessage = document.createElement('div');
    userMessage.classList.add('chat-message', 'user');
    userMessage.textContent = message;
    chatBody.appendChild(userMessage);

    // Scroll to bottom
    chatBody.scrollTop = chatBody.scrollHeight;

    // Simulate bot response (placeholder logic)
    setTimeout(() => {
        let botResponse = 'I\'m still learning! Thank you for your question.';
        
        if (message.toLowerCase().includes('latest publication')) {
            botResponse = 'The latest placeholder publication added is "Microgravity Impact on Martian Plant Growth" (2025). Check the Publications tab for more!';
        } else if (message.toLowerCase().includes('submit')) {
            botResponse = 'To submit a publication, please navigate to the Publications tab and click the "Submit a new publication" link.';
        } else if (message.toLowerCase().includes('challenge')) {
            botResponse = 'The EXBIO Portal is built for the NASA Space Apps Challenge 2025: "Build a Space Biology Knowledge Engine".';
        }

        const botMsg = document.createElement('div');
        botMsg.classList.add('chat-message', 'bot');
        botMsg.textContent = botResponse;
        chatBody.appendChild(botMsg);
        
        // Scroll to bottom
        chatBody.scrollTop = chatBody.scrollHeight;
    }, 800);
}

/**
 * Handles the 'Send' button or Enter key for the chat input.
 */
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

/**
 * Allows chat options to be sent as messages.
 */
function sendChatOption(message) {
    // Remove the chat options after one is chosen (to keep the chat clean)
    document.querySelectorAll('.chat-options').forEach(opt => opt.remove());
    sendMessage(message);
}
// Attach the chat option sender globally
window.sendChatOption = sendChatOption;
window.toggleChat = toggleChat;
window.handleChatInput = handleChatInput;


// ---------------------------------
// Publications Functions (Same as previous revision)
// ---------------------------------

/**
 * Simple CSV parser: converts a CSV string into an array of objects.
 */
function parseCSV(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) return [];
    
    // Simple header parsing - assumes no commas in headers for simplicity
    const headers = lines[0].split(',').map(header => header.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
        
        if (values.length === headers.length) {
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index].replace(/"/g, '').trim();
            });
            data.push(row);
        }
    }
    return data;
}

/**
 * Fetches the CSV file from GitHub and stores the data.
 */
async function loadPublicationsData() {
    if (allPublications.length > 0) {
        filterPublications(); 
        return;
    }
    
    const dashboard = document.getElementById('publications-dashboard');
    dashboard.innerHTML = '<p>Fetching data from GitHub...</p>';
    
    try {
        const response = await fetch(CSV_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const csvText = await response.text();
        
        allPublications = parseCSV(csvText);
        filterPublications(); 

    } catch (error) {
        console.error("Error loading CSV file:", error);
        dashboard.innerHTML = `<p style="color:red;">Error loading publications. Check the CSV URL and format. (${error.message})</p>`;
    }
}

/**
 * Renders the publications array into the dynamic dashboard (cards).
 */
function renderPublications(publications) {
    const dashboard = document.getElementById('publications-dashboard');
    dashboard.innerHTML = ''; 

    if (publications.length === 0) {
        dashboard.innerHTML = '<p>No publications found matching the criteria.</p>';
        return;
    }

    publications.forEach(pub => {
        const title = pub.Title || 'Untitled Publication';
        const link = pub.Link || '#';
        const author = pub.Author || 'Unknown Author';
        const summary = pub['Placeholder Summary (AI Output Simulation)'] || 'AI Summary Pending...';
        const subjects = pub.Subjects || 'No Subjects';

        const card = document.createElement('div');
        card.classList.add('publication-card');
        
        card.innerHTML = `
            <h3>${title}</h3>
            <p class="author">${author} (${pub.Year || 'N/A'})</p>
            <div class="summary">
                **AI Summary:** ${summary}
            </div>
            <p class="tags">Subjects: ${subjects}</p>
            <a href="${link}" target="_blank">Read Full Publication →</a>
        `;
        dashboard.appendChild(card);
    });
}

/**
 * Filters the publications based on search query and active subject tag.
 */
function filterPublications() {
    const query = document.getElementById('search-publications').value.toLowerCase();
    
    if (allPublications.length === 0) {
        loadPublicationsData(); 
        return; 
    }
    
    const filtered = allPublications.filter(pub => {
        const searchMatch = (
            (pub.Title || '').toLowerCase().includes(query) ||
            (pub.Author || '').toLowerCase().includes(query) ||
            (pub['Placeholder Summary (AI Output Simulation)'] || '').toLowerCase().includes(query)
        );

        const tagMatch = currentTag === 'all' || (pub.Subjects && pub.Subjects.includes(currentTag));
        
        return searchMatch && tagMatch;
    });

    renderPublications(filtered);
}

/**
 * Handles clicks on the subject tag buttons.
 */
function handleTagClick(e) {
    const newTag = e.currentTarget.getAttribute('data-tag');
    currentTag = newTag;

    document.querySelectorAll('.tag-button').forEach(btn => {
        btn.classList.remove('active-tag');
    });
    e.currentTarget.classList.add('active-tag');

    filterPublications();
}
// Attach the functions globally
window.filterPublications = filterPublications;
document.addEventListener('DOMContentLoaded', () => {
    // Setup Subject Tag handlers
    document.querySelectorAll('.tag-button').forEach(tagButton => {
        tagButton.addEventListener('click', handleTagClick);
    });

    setupNavigation();
    renderUserTypeGraph(); // Draw the initial graph
    // The application starts on the user-selection-page, which then calls handleUserSelection
});
