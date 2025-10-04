document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.getElementById('main-content');
    const navItems = document.querySelectorAll('.nav-item, .nav-sub-item');
    const dropdownParents = document.querySelectorAll('.dropdown-parent');
    
    // --- Content Map (Updated with detailed descriptions) ---
    const contentMap = {
        // Primary Tabs
        'about-us': { title: 'About Us: EXBIO Portal Mission', content: '<p>The EXBIO Portal is a collaborative, global platform dedicated to advancing research in Exobiology, Astrobiology, and the future of Biospace studies. Our mission is to connect scientists, facilitate data exchange, and accelerate discoveries related to life beyond Earth and the biological effects of space exploration.</p><p>We prioritize the core values of Safety, Integrity, Inclusion, and Excellence in all research and community engagement.</p>' },
        'news': { title: 'Latest News & Events', content: '<h1>News Feed</h1><p>Stay updated with the newest discoveries, mission announcements, and upcoming scientific conferences related to life beyond Earth and deep space biology. Check back daily for breaking news from NASA, ESA, and other international space agencies.</p><ul><li>**Oct 2025:** Successful deployment of the new Bio-Sensor array on the ISS.</li><li>**Nov 2025:** Call for abstracts opens for the annual Biospace Genomics Symposium.</li></ul>' },
        'library': { title: 'Digital Research Library', content: '<h1>Access Resources</h1><p>Access our extensive, cross-referenced collection of peer-reviewed articles, technical reports, mission documentation, and open-source data related to exobiology research. Search, filter, and download materials for your current projects.</p>' },
        'publications': { title: 'EXBIO Publications Portal', content: '<h1>Publications Overview</h1><p>This is the central hub for all research published through or recommended by the EXBIO consortium. Use the sub-navigation to find announcements or submit your own work for peer review.</p>' },
        
        // Publications Dropdown
        'pub-announcements': { title: 'Announcements', content: '<h1>Editorial Announcements</h1><p>Official updates regarding portal changes, funding opportunities, research collaborations, and new journal issue releases. Please review the *Author Guidelines* for the latest submission requirements.</p>' },
        'pub-submit': { title: 'Submit a New Publication', content: '<h1>Submission Guidelines</h1><p>Follow the step-by-step process to submit your research paper for review. All submissions must adhere to the EXBIO data standards for ethics, reproducibility, and data archiving. A dedicated submission interface is available after login.</p>' },

        // Activities Dropdown (Spelling Corrected)
        'activities': { title: 'Collaborative Activities', content: '<h1>Community Engagement and Tools</h1><p>Engage with the community through our specialized sections. Select an option from the submenu to participate in discussions or access interactive learning tools.</p>' },
        'act-qa': { title: 'Question and Answer Section', content: '<h1>Q&A Forum</h1><p>Post your complex research questions, answer peers, and engage in scientific debates. The Q&A section is moderated by senior scientists to ensure high-quality, professional discourse.</p>' },
        'act-interactives': { title: 'Interactives', content: '<h1>Interactive Tools & Simulations</h1><p>Access 3D models of biospace experiments, microgravity simulation tools, and dynamic data visualization charts to explore biological processes under extreme space conditions.</p>' },

        // Career Dropdown
        'career': { title: 'Career Opportunities', content: '<h1>Biospace Careers</h1><p>Find your next role in astrobiology, space medicine, life support systems, or related fields. The EXBIO portal connects you with opportunities at leading institutions globally.</p>' },
        'car-nasa': { title: 'Life at NASA', content: '<h1>Life at NASA</h1><p>NASA is driven by its core values: Safety, Integrity, Inclusion, Teamwork, and Excellence. Working here means engaging in ambitious projects, from exploring deep space to innovating for the benefit of humanity, all within a culture that encourages curiosity and continuous professional growth.</p>' },
        'car-future': { title: 'Future of Biospace Studies', content: '<h1>The Next Frontier</h1><p>The future of Biospace Studies focuses on long-term human survival beyond Earth. Key research areas include bio-regenerative life support systems, mitigating radiation effects on DNA, personalized space medicine, and searching for biosignatures in extreme environments on other planetary bodies.</p>' },
    };

    // --- 1. Content and Navigation Handler ---
    function loadContent(pageId) {
        // Clear all active states (links and dropdowns)
        navItems.forEach(item => item.classList.remove('active'));
        dropdownParents.forEach(parent => parent.classList.remove('open'));

        // Set active state on the clicked item
        const clickedItem = document.querySelector(`[data-page="${pageId}"]`);
        if (clickedItem) {
            clickedItem.classList.add('active');
            
            // Open and highlight the parent if a sub-item was clicked
            const parentLi = clickedItem.closest('.dropdown-parent');
            if (parentLi) {
                 parentLi.classList.add('open');
                 parentLi.querySelector('.nav-item').classList.add('active'); 
            }
        }

        // Load the content
        const data = contentMap[pageId] || { title: 'Content Error', content: 'The requested page content is not currently available.' };
        mainContent.innerHTML = `<h1>${data.title}</h1><p>${data.content}</p>`;
    }

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = e.target.getAttribute('data-page');
            loadContent(pageId);
        });
    });

    // --- 2. Dropdown Toggle Handler ---
    dropdownParents.forEach(parent => {
        const parentLink = parent.querySelector('.nav-item');
        parentLink.addEventListener('click', (e) => {
             // Toggles the 'open' class which controls the CSS transition for max-height
             parent.classList.toggle('open');
        });
    });

    // Load a default page on initial load
    loadContent('about-us');


    // --- 3. Chatbot Toggle ---
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotWindow = document.getElementById('chatbot-window');

    chatbotToggle.addEventListener('click', () => {
        const isVisible = chatbotWindow.style.display === 'flex';
        chatbotWindow.style.display = isVisible ? 'none' : 'flex';
    });


    // --- 4. Settings Modal ---
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeModalBtn = settingsModal.querySelector('.close-btn');
    const settingNavLinks = settingsModal.querySelectorAll('.settings-nav a');
    const settingTabs = settingsModal.querySelectorAll('.setting-tab');

    // Open Modal
    settingsBtn.addEventListener('click', () => {
        settingsModal.style.display = 'block';
    });

    // Close Modal via X button
    closeModalBtn.addEventListener('click', () => {
        settingsModal.style.display = 'none';
    });

    // Close Modal if user clicks outside of it
    window.addEventListener('click', (event) => {
        if (event.target === settingsModal) {
            settingsModal.style.display = 'none';
        }
    });

    // Settings Tab Switching Logic
    settingNavLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Get target ID
            const targetId = e.target.getAttribute('data-setting-tab');
            
            // Remove active class from all links and tabs
            settingNavLinks.forEach(l => l.classList.remove('active'));
            settingTabs.forEach(t => t.classList.remove('active'));

            // Add active class to the clicked link
            e.target.classList.add('active');

            // Show the corresponding tab
            document.getElementById(`${targetId}-settings`).classList.add('active');
        });
    });


    // --- 5. Logout Functionality (Placeholder) ---
    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn.addEventListener('click', () => {
        if (confirm("Are you sure you want to log out of the EXBIO Portal?")) {
            // Simulate logout by replacing content
            mainContent.innerHTML = '<h1>Logged Out Successfully</h1><p>You have been securely logged out. Please log in again to access the portal.</p>';
            
            // Disable navigation (optional, for a quick simulation)
            navItems.forEach(item => item.style.pointerEvents = 'none');
        }
    });
});
