// --- 1. DATA AND INITIAL SETUP ---

let allPublications = [];
let currentRole = null;
let currentActiveTab = 'about'; // Default starting tab
const PUBLICATIONS_CSV_URL = 'publications_pmc.csv'; 

// Dummy Data to simulate the content of publications_pmc.csv
const DUMMY_CSV_DATA = `ID,Title,Abstract Summary,Year,PMC_Link
1,Effects of Microgravity on Human Bone Density,A study analyzing the impact of long-duration spaceflight on bone loss in astronauts. Findings inform countermeasure development.,2022,https://example.com/pub/1
2,Radiation Shielding for Lunar Habitats,Research into new composite materials for shielding against cosmic radiation in deep space missions.,2023,https://example.com/pub/2
3,Plant Growth in Closed-Loop Life Support Systems,Investigating optimal nutrient delivery for crops grown on the ISS to support bioregenerative life support.,2021,https://example.com/pub/3
4,Psychological Effects of Isolation on Crew,Longitudinal study of crew behavioral health during simulated Mars missions to identify risk factors.,2024,https://example.com/pub/4
5,Microbial Ecology of the International Space Station,Mapping the diversity of fungal and bacterial communities on ISS surfaces and their potential impact on hardware and crew health.,2023,https://example.com/pub/5
6,Automated Health Monitoring for Deep Space,Development of AI-driven systems to diagnose and treat common illnesses without Earth support.,2024,https://example.com/pub/6
7,Metabolic Changes During Long-Duration Spaceflight,A comprehensive analysis of astronaut metabolism and its implications for nutrition planning beyond LEO.,2022,https://example.com/pub/7
8,Advanced Water Recycling Technologies for Space,Testing next-generation water recovery systems for highly efficient closed-loop environmental control.,2021,https://example.com/pub/8
9,Bone Density Loss in Long-Term Missions,A follow-up study confirming initial findings on bone density. Crucial data for mission architects.,2024,https://example.com/pub/9
10,Impact of Space Radiation on Gene Expression,Study on how different types of space radiation affect gene expression patterns in human cells.,2023,https://example.com/pub/10
`;

function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length === headers.length) {
            let row = {};
            for (let j = 0; j < headers.length; j++) {
                row[headers[j].trim()] = values[j].trim();
            }
            data.push(row);
        }
    }
    return data;
}

async function loadPublications() {
    try {
        const response = await fetch(PUBLICATIONS_CSV_URL);
        if (!response.ok) {
            allPublications = parseCSV(DUMMY_CSV_DATA);
        } else {
            const csvText = await response.text();
            allPublications = parseCSV(csvText);
        }
    } catch (error) {
        allPublications = parseCSV(DUMMY_CSV_DATA);
    }
    
    renderPublications(allPublications);
    populateYearFilter();
    updateRowCount(allPublications.length);
    enableChatInput();
}


// --- 2. PUBLICATIONS TAB LOGIC ---

function renderPublications(publications) {
    const tbody = document.querySelector('#publications-table tbody');
    tbody.innerHTML = '';
    
    if (publications.length === 0) {
        const row = tbody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 5;
        cell.textContent = "No publications found matching your criteria.";
        return;
    }

    publications.forEach(pub => {
        const row = tbody.insertRow();
        row.insertCell().textContent = pub.ID;
        row.insertCell().textContent = pub.Title;
        row.insertCell().textContent = pub['Abstract Summary'].substring(0, 100) + '...';
        row.insertCell().textContent = pub.Year;
        
        const linkCell = row.insertCell();
        const link = document.createElement('a');
        link.href = pub.PMC_Link;
        link.target = '_blank';
        link.textContent = 'View';
        linkCell.appendChild(link);
    });
    updateRowCount(publications.length);
}

function populateYearFilter() {
    const yearFilter = document.getElementById('year-filter');
    const years = [...new Set(allPublications.map(pub => pub.Year))].sort((a, b) => b - a);
    
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
    });
}

function handleSearchAndFilter() {
    const searchTerm = document.getElementById('publication-search').value.toLowerCase();
    const selectedYear = document.getElementById('year-filter').value;

    const filtered = allPublications.filter(pub => {
        const matchesSearch = searchTerm === '' ||
            pub.Title.toLowerCase().includes(searchTerm) ||
            pub['Abstract Summary'].toLowerCase().includes(searchTerm);
        
        const matchesYear = selectedYear === '' || pub.Year === selectedYear;

        return matchesSearch && matchesYear;
    });

    renderPublications(filtered);
}

function updateRowCount(count) {
    document.getElementById('row-count').textContent = `Showing ${count} of ${allPublications.length} publications.`;
}


// --- 3. CHATBOT LOGIC (SIMULATED AI) ---

function enableChatInput() {
    document.getElementById('chat-input').disabled = false;
    document.getElementById('send-chat-btn').disabled = false;
}

function addMessage(text, type, linkData = null) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = text;
    
    if (linkData) {
        const link = document.createElement('a');
        link.href = linkData.url;
        link.target = '_blank';
        link.className = 'chat-link';
        link.textContent = `Source: ${linkData.title} (ID: ${linkData.id})`;
        messageDiv.appendChild(link);
    }

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function respondToChat(message) {
    const msg = message.toLowerCase();
    let responseText = "I found this relevant data, but please refine your question for a specific answer.";
    let link = null;
    
    const keywords = msg.split(' ');
    let bestMatch = null;
    let maxMatches = 0;

    allPublications.forEach(pub => {
        let matchCount = 0;
        const pubText = (pub.Title + ' ' + pub['Abstract Summary']).toLowerCase();
        keywords.forEach(keyword => {
            if (keyword.length > 3 && pubText.includes(keyword)) {
                matchCount++;
            }
        });

        if (matchCount > maxMatches) {
            maxMatches = matchCount;
            bestMatch = pub;
        }
    });

    if (bestMatch && maxMatches > 0) {
        if (msg.includes('bone') || msg.includes('microgravity')) {
            responseText = `Based on current research, long-term microgravity is known to cause bone density loss in astronauts. See the linked research for details.`;
        } else if (msg.includes('radiation') || msg.includes('shielding')) {
            responseText = `Protecting crews from space radiation is critical. Research focuses on advanced shielding materials. The following publication explores this area.`;
        } else {
            responseText = `I found a highly relevant publication for your query based on keywords. The central theme of this research is: "${bestMatch.Title}".`;
        }
        
        link = {
            title: bestMatch.Title.substring(0, 50) + '...',
            url: bestMatch.PMC_Link,
            id: bestMatch.ID
        };
    } else if (msg.includes('hello') || msg.includes('hi')) {
        responseText = "Hello! I am ready to help you navigate Space Biology research. Try asking about 'radiation shielding' or 'bone density loss'.";
    }

    setTimeout(() => {
        addMessage(responseText, 'system', link);
    }, 800);
}


// --- 4. UI MANAGEMENT (TABS, DROPDOWNS, ROLES) ---

function showTab(tabId) {
    // 1. Deactivate all content and buttons
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('active'));
    
    // 2. Hide all dropdown content
    document.querySelectorAll('.dropdown-content').forEach(content => content.style.display = 'none');

    // 3. Activate new content
    const newTabContent = document.getElementById(tabId);
    if (newTabContent) {
        newTabContent.classList.add('active');
        currentActiveTab = tabId;

        // 4. Find and activate the button/dropdown chain
        const clickedButton = document.querySelector(`.nav-button[data-tab="${tabId}"]`) || 
                              document.querySelector(`.nav-button[data-tab-main="${tabId}"]`);
        
        if (clickedButton) {
            clickedButton.classList.add('active');
            
            // If it's a sub-tab, activate its parent main tab too (for visual consistency)
            const parentDropdown = clickedButton.closest('.dropdown');
            if (parentDropdown) {
                parentDropdown.querySelector('.dropdown-main').classList.add('active');
            }
        }
    }
}

function handleTabClick(e) {
    const tabId = e.target.dataset.tab;
    const tabMainId = e.target.dataset.tabMain;

    if (tabId) {
        // Clicks a content tab (e.g., 'pub-library', 'about', 'news')
        showTab(tabId);
    } else if (tabMainId) {
        // Clicks a main dropdown button (e.g., 'Publications', 'Activities')
        const dropdownContent = document.querySelector(`[data-dropdown="${tabMainId}"]`);
        
        // Toggle the dropdown visibility
        if (dropdownContent) {
            // Close all other dropdowns
            document.querySelectorAll('.dropdown-content').forEach(content => {
                if (content !== dropdownContent) content.style.display = 'none';
            });

            // Toggle the current one
            if (dropdownContent.style.display === 'block') {
                dropdownContent.style.display = 'none';
            } else {
                dropdownContent.style.display = 'block';
                // Automatically switch to the first sub-tab if available
                const firstSubTab = dropdownContent.querySelector('.nav-button[data-tab]');
                if (firstSubTab) {
                    showTab(firstSubTab.dataset.tab);
                }
            }
        }
    }
}

function showRoleModal() {
    document.getElementById('role-selector-modal').style.display = 'block';
}

function hideRoleModal() {
    document.getElementById('role-selector-modal').style.display = 'none';
}

function setRole(role) {
    currentRole = role;
    document.getElementById('user-role-display').textContent = `Role: ${role}`;
    hideRoleModal();
    updateRoleSpecificContent();
    // Ensure the default tab is shown after role is set
    showTab(currentActiveTab); 
}

function updateRoleSpecificContent() {
    // Manage Role Tip Visibility
    document.querySelectorAll('.role-tip').forEach(tip => {
        const roles = tip.dataset.roleTarget.split(',');
        if (roles.includes(currentRole)) {
            tip.style.display = 'block';
        } else {
            tip.style.display = 'none';
        }
    });
}

function handleQuizCheck(e) {
    const correct = e.target.dataset.correct;
    const selected = document.querySelector('input[name="q1"]:checked');
    const feedback = document.querySelector('.quiz-feedback');
    
    if (selected) {
        if (selected.value === correct) {
            feedback.textContent = 'Correct! Bone density loss is a major challenge.';
            feedback.className = 'quiz-feedback feedback-correct';
        } else {
            feedback.textContent = 'Incorrect. The primary effect is bone density loss.';
            feedback.className = 'quiz-feedback feedback-wrong';
        }
    } else {
        feedback.textContent = 'Please select an answer.';
        feedback.className = 'quiz-feedback feedback-wrong';
    }
}


// --- 5. EVENT LISTENERS AND INITIALIZATION ---

document.addEventListener('DOMContentLoaded', () => {
    loadPublications(); 
    showRoleModal(); 

    // A. Role Selector
    document.querySelectorAll('.role-button').forEach(button => {
        button.addEventListener('click', (e) => setRole(e.target.dataset.role));
    });
    document.getElementById('change-role-btn').addEventListener('click', showRoleModal);

    // B. Navigation/Tab Switching (Handles all main and sub-tabs)
    document.querySelector('.tabs').addEventListener('click', handleTabClick);
    
    // C. Publications Search and Filter
    document.getElementById('publication-search').addEventListener('input', handleSearchAndFilter);
    document.getElementById('year-filter').addEventListener('change', handleSearchAndFilter);

    // D. Chatbot (Floating Modal)
    const chatbotModal = document.getElementById('chatbot-modal');
    document.getElementById('fixed-chatbot-btn').addEventListener('click', () => {
        chatbotModal.style.display = 'flex';
    });
    document.getElementById('close-chatbot-btn').addEventListener('click', () => {
        chatbotModal.style.display = 'none';
    });
    
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-chat-btn');
    
    const handleChat = () => {
        const message = chatInput.value.trim();
        if (message === "") return;
        addMessage(message, 'user');
        respondToChat(message);
        chatInput.value = '';
    };

    sendBtn.addEventListener('click', handleChat);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleChat();
    });

    // E. Quiz Activity Check
    const quizButton = document.querySelector('.check-answer-btn');
    if (quizButton) {
        quizButton.addEventListener('click', handleQuizCheck);
    }

    // F. Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown-content').forEach(content => content.style.display = 'none');
        }
    });
});
