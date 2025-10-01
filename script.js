// Data for Navigation and Submenus
const navData = {
    'Home': 'home',
    'About Us': 'about-us',
    'Publications': 'publications', // Sub-menu logic handled by filters/buttons on the page
    'Activities': 'activities',
    'News': 'news',
    'Career': 'career',
    'Library': 'library'
};

// Raw link for the CSV file from GitHub
const PUBLICATIONS_CSV_URL = 'https://raw.githubusercontent.com/jgalazka/SB_publications/main/SB_publications_masterlist.csv';

// Global variable to store the selected user role
let selectedUserType = 'Visitor';

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. User Selection Logic ---
    const selectionScreen = document.getElementById('selection-screen');
    const portalScreen = document.getElementById('portal-screen');
    const userCards = document.querySelectorAll('.user-card');
    const continueBtn = document.getElementById('continue-btn');
    const logoutBtn = document.getElementById('logout-btn');

    userCards.forEach(card => {
        card.addEventListener('click', () => {
            userCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedUserType = card.getAttribute('data-type');
            document.getElementById('current-user-role').textContent = selectedUserType;
            continueBtn.disabled = false;
        });
    });

    continueBtn.addEventListener('click', () => {
        if (selectedUserType) {
            selectionScreen.classList.remove('active');
            portalScreen.classList.add('active');
            // Update role display on the home page
            document.getElementById('current-user-role').textContent = selectedUserType;
            initializePortal();
        }
    });
    
    logoutBtn.addEventListener('click', () => {
        portalScreen.classList.remove('active');
        selectionScreen.classList.add('active');
        userCards.forEach(c => c.classList.remove('selected'));
        continueBtn.disabled = true;
        selectedUserType = 'Visitor';
        handleNavigation('home'); // Reset view to home
    });

    // If the portal screen is active initially (for testing), initialize it.
    if (portalScreen.classList.contains('active')) {
        initializePortal();
    }
    
    // --- 2. Portal Navigation Logic ---
    function initializePortal() {
        const navContainer = document.getElementById('main-nav');
        navContainer.innerHTML = ''; // Clear existing navigation

        // Build main navigation links in the sidebar
        for (const [key, pageId] of Object.entries(navData)) {
            const link = document.createElement('a');
            link.href = `#${pageId}`;
            link.textContent = key;
            link.setAttribute('data-page', pageId);
            
            if (pageId === 'home') {
                link.classList.add('active');
            }

            link.addEventListener('click', (e) => {
                e.preventDefault();
                handleNavigation(pageId, link);
                
                // If Publications is clicked, load the CSV data
                if (pageId === 'publications') {
                    loadPublicationsData();
                }
            });
            navContainer.appendChild(link);
        }

        // Set initial page view
        handleNavigation('home', navContainer.querySelector('[data-page="home"]'));
    }

    function handleNavigation(targetPageId, clickedLink = null) {
        // 1. Update active link in navigation
        document.querySelectorAll('#main-nav a').forEach(a => a.classList.remove('active'));
        if (clickedLink) {
            clickedLink.classList.add('active');
        }

        // 2. Update page content
        const allPages = document.querySelectorAll('.page');
        allPages.forEach(p => p.classList.remove('active-page'));
        
        const targetPage = document.getElementById(targetPageId + '-page');
        if (targetPage) {
            targetPage.classList.add('active-page');
        }
    }
    
    // --- 3. CSV Data Loading and Display (Publications Hub) ---
    function loadPublicationsData() {
        const tableBody = document.querySelector('#publications-table tbody');
        tableBody.innerHTML = '<tr><td colspan="3">Loading publications data from GitHub...</td></tr>';

        // Check if Papa is defined (i.e., if the CDN script loaded)
        if (typeof Papa === 'undefined') {
            tableBody.innerHTML = '<tr><td colspan="3" style="color: red;">Error: Papa Parse library not loaded. Check index.html.</td></tr>';
            return;
        }

        Papa.parse(PUBLICATIONS_CSV_URL, {
            download: true,
            header: true,
            skipEmptyLines: true,
            complete: function(results) {
                const data = results.data;
                tableBody.innerHTML = '';

                if (data.length === 0) {
                    tableBody.innerHTML = '<tr><td colspan="3">No publications found.</td></tr>';
                    return;
                }

                // Use only the first 50 items for demonstration speed
                data.slice(0, 50).forEach(item => {
                    const row = tableBody.insertRow();
                    
                    // Column 1: Title (The actual column name for Title might be 'Title' or 'title')
                    const titleText = item.Title || item.title || 'No Title Available';
                    row.insertCell().textContent = titleText;
                    
                    // Column 2: Link (The actual column name might be 'Link' or 'link_out')
                    const linkCell = row.insertCell();
                    const linkUrl = item.Link || item.link_out || '#';
                    if (linkUrl !== '#') {
                        linkCell.innerHTML = `<a href="${linkUrl}" target="_blank">View</a>`;
                    } else {
                        linkCell.textContent = 'N/A';
                    }

                    // Column 3: Summary Icon (AI Feature Trigger)
                    const summaryCell = row.insertCell();
                    summaryCell.innerHTML = `<i class="fas fa-search-plus summary-icon" title="Generate AI Summary"></i>`;
                    
                    summaryCell.querySelector('.summary-icon').addEventListener('click', () => {
                        // This simulates the AI backend call
                        alert(`
                            --- AI Summary Simulation ---
                            Role: ${selectedUserType}
                            Publication: ${titleText}
                            
                            (Actual logic would now call the Gemini API with the full publication text to generate a summary tailored to the ${selectedUserType} role.)
                        `);
                    });
                });
            },
            error: function(error) {
                tableBody.innerHTML = `<tr><td colspan="3" style="color: red;">Error loading data: ${error.message}</td></tr>`;
            }
        });
    }

    // --- 4. Chatbot Logic ---
    const chatbotIcon = document.getElementById('chatbot-icon');
    const chatbotPanel = document.getElementById('chatbot-panel');
    const chatCloseBtn = document.getElementById('chat-close-btn');
    const chatInputField = document.getElementById('chat-input-field');
    const chatSendBtn = document.getElementById('chat-send-btn');
    const chatMessages = document.getElementById('chat-messages');
    const quickReplyBtns = document.querySelectorAll('.quick-reply-btn');

    // Toggle Chatbot Panel
    chatbotIcon.addEventListener('click', () => {
        chatbotPanel.classList.toggle('hidden');
    });

    chatCloseBtn.addEventListener('click', () => {
        chatbotPanel.classList.add('hidden');
    });

    // Function to add a message to the chat
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        const paragraph = document.createElement('p');
        paragraph.textContent = text;
        messageDiv.appendChild(paragraph);
        chatMessages.appendChild(messageDiv);
        
        // Scroll to the bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Simulated AI Response Logic
    function getBotResponse(userText) {
        userText = userText.toLowerCase();

        if (userText.includes('publications') || userText.includes('latest')) {
            return "The Publications Hub provides access to all 608 NASA bioscience papers. You can use the filters or search bar to find relevant studies for your mission.";
        } else if (userText.includes('library') || userText.includes('repository') || userText.includes('osdr')) {
            return "The Library page links to key NASA resources: the Open Science Data Repository (OSDR), the Space Life Sciences Library (NSLSL), and the Task Book. These provide raw data, comprehensive literature, and project details.";
        } else if (userText.includes('summary') || userText.includes('ai') || userText.includes('work')) {
            return `The AI Summary tool generates a context-specific summary for each publication. It tailors the focus based on your current role: ${selectedUserType}. This requires a powerful language model to analyze the full text.`;
        } else if (userText.includes('hello') || userText.includes('hi')) {
            return `Hello! I'm EXBICHAT, built to help you navigate this portal. Your current perspective is set as a ${selectedUserType}. What can I assist you with today?`;
        }
        else {
            return "I'm focusing on navigation and core data features right now! Try asking about 'Publications', the 'Library', or 'AI Summary'.";
        }
    }

    // Handle sending a message
    function sendMessage() {
        const userText = chatInputField.value.trim();
        if (userText === "") return;

        addMessage(userText, 'user');
        chatInputField.value = '';

        // Simulate a delay for the bot response
        setTimeout(() => {
            const botResponse = getBotResponse(userText);
            addMessage(botResponse, 'bot');
        }, 800);
    }

    // Event Listeners for send and quick replies
    chatSendBtn.addEventListener('click', sendMessage);
    
    chatInputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    quickReplyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const query = btn.getAttribute('data-query');
            addMessage(query, 'user');
            
            setTimeout(() => {
                const botResponse = getBotResponse(query);
                addMessage(botResponse, 'bot');
            }, 800);
        });
    });
});
