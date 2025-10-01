// Data for Navigation and Submenus
const navData = {
    'Home': 'home',
    'About Us': 'about-us',
    'Publications': {
        id: 'publications',
        submenu: ['Latest Publications', 'Announcements', 'Submit a Publication']
    },
    'Activities': {
        id: 'activities',
        submenu: ['Q/A Section', 'Interactives']
    },
    'News': 'news',
    'Career': {
        id: 'career',
        submenu: ['Life at NASA', 'Future of BioSpace']
    },
    'Library': {
        id: 'library',
        submenu: [
            'NASA Open Science Data Repository',
            'NASA Space Life Sciences Library',
            'NASA Task Book'
        ]
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // --- User Selection Logic ---
    const userCards = document.querySelectorAll('.user-card');
    const continueBtn = document.getElementById('continue-btn');
    let selectedUserType = null;

    userCards.forEach(card => {
        card.addEventListener('click', () => {
            // Remove selection from all
            userCards.forEach(c => c.classList.remove('selected'));
            
            // Select the clicked card
            card.classList.add('selected');
            selectedUserType = card.getAttribute('data-type');
            continueBtn.disabled = false;
        });
    });

    continueBtn.addEventListener('click', () => {
        if (selectedUserType) {
            document.getElementById('selection-screen').classList.remove('active');
            document.getElementById('portal-screen').classList.add('active');
            // Optional: Store selectedUserType for later use/customization
            console.log("User selected:", selectedUserType);
            // Initialize the portal components
            initializePortal();
        }
    });

    // --- Portal Navigation Logic ---
    function initializePortal() {
        const navContainer = document.getElementById('main-nav');
        const contentContainer = document.getElementById('content');

        // Build main navigation links
        for (const [key, value] of Object.entries(navData)) {
            const isDropdown = typeof value === 'object';
            const pageId = isDropdown ? value.id : value;

            const link = document.createElement('a');
            link.href = '#';
            link.textContent = key;
            link.setAttribute('data-page', pageId);
            
            // Set 'Home' as active initially
            if (pageId === 'home') {
                link.classList.add('active');
            }

            link.addEventListener('click', (e) => {
                e.preventDefault();
                handleNavigation(pageId, link);
            });
            navContainer.appendChild(link);
        }

        // Initial content display
        handleNavigation('home', navContainer.querySelector('[data-page="home"]'));

        // --- Data Loading and AI/Summary Guidance ---
        
        // This function would fetch and display the CSV data for the Publications page
        // NOTE: Direct CSV loading from GitHub requires a CORS-friendly server or a library.
        // For a basic setup, you can manually convert the CSV to a JSON array for easy JS loading.
        function loadPublicationsData() {
            const tableBody = document.querySelector('#publications-table tbody');
            // Placeholder for data fetching logic
            const placeholderData = [
                { title: "Example Publication 1", link: "#", summaryIcon: "..." },
                { title: "Example Publication 2", link: "#", summaryIcon: "..." }
            ];

            tableBody.innerHTML = ''; // Clear existing
            placeholderData.forEach(item => {
                const row = tableBody.insertRow();
                row.insertCell().textContent = item.title;
                const linkCell = row.insertCell();
                linkCell.innerHTML = `<a href="${item.link}">View</a>`;
                
                const summaryCell = row.insertCell();
                // Icon to trigger the summary AI (requires separate AI service)
                summaryCell.innerHTML = `<i class="fas fa-magic summary-icon" title="Generate Summary"></i>`;
                summaryCell.querySelector('.summary-icon').addEventListener('click', () => {
                    alert('Summary generation is a future feature!\nTitle: ' + item.title);
                    // Actual logic would call your AI endpoint here
                });
            });
        }
        
        // Call this when 'publications' is navigated to
        loadPublicationsData(); 
    }

    function handleNavigation(targetPageId, clickedLink) {
        // 1. Update active link in navigation
        document.querySelectorAll('#main-nav a').forEach(a => a.classList.remove('active'));
        clickedLink.classList.add('active');

        // 2. Update page content
        const allPages = document.querySelectorAll('.page');
        allPages.forEach(p => p.classList.remove('active-page'));
        
        const targetPage = document.getElementById(targetPageId + '-page');
        if (targetPage) {
            targetPage.classList.add('active-page');
            
            // Logic for displaying sub-pages/content within the main pages
            if (targetPageId === 'publications') {
                // Here you would check the dropdown/filter to show specific data
                console.log("Navigated to Publications. Loading data...");
            } 
            // Add similar logic for Library, Career, etc., to display sub-menu content
            
        } else {
            // For pages that haven't been fully structured yet, create a placeholder
            let placeholder = document.getElementById('placeholder-page');
            if (!placeholder) {
                 placeholder = document.createElement('section');
                 placeholder.id = 'placeholder-page';
                 placeholder.classList.add('page', 'active-page');
                 document.getElementById('content').appendChild(placeholder);
            }
            
            placeholder.innerHTML = `<h2>${clickedLink.textContent}</h2><p>Content for the <strong>${clickedLink.textContent}</strong> page is currently under construction. Please check back later!</p>`;
        }
    }
    
    // NOTE on Chatbot: The icon is styled in CSS and added in HTML. 
    // Implementing the actual chatbot requires a separate library or an API integration 
    // to connect to an AI model (like Gemini). The icon handler would open the chat window:
    document.getElementById('chatbot-icon').addEventListener('click', () => {
        alert("The EXBICHAT AI is ready! (This would open the chat window/panel)");
    });
});
