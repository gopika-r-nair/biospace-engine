document.addEventListener('DOMContentLoaded', () => {
    const sidebarLinks = document.querySelectorAll('.nav-menu a');
    const pageContents = document.querySelectorAll('.page-content');
    
    // --- Configuration ---
    // URL to the RAW CSV file on your GitHub repository
    const PUBLICATIONS_CSV_URL = 'https://raw.githubusercontent.com/gopika-r-nair/biospace-engine/main/publications_pmc.csv';
    const PUBLICATIONS_TABLE_CONTAINER = document.getElementById('publications-data-table');

    // --- Page Switching Logic ---
    function setActivePage(pageId) {
        // 1. Deactivate all pages and links
        pageContents.forEach(page => page.classList.remove('active'));
        sidebarLinks.forEach(link => link.classList.remove('active'));

        // 2. Activate the selected page/link
        const newPage = document.getElementById(pageId + '-page');
        const newLink = document.querySelector(`[data-page="${pageId}"]`);
        
        if (newPage) newPage.classList.add('active');
        if (newLink) newLink.classList.add('active');

        // Handle active state for parent of a sub-link
        const subLink = document.querySelector(`[data-page="${pageId}"]`);
        if (subLink && subLink.closest('.dropdown-parent')) {
             subLink.closest('.dropdown-parent').querySelector('.nav-item').classList.add('active');
        }

        // 3. Special handling for Publications (CSV Load)
        if (pageId === 'publications') {
            loadPublicationsCSV();
        }
    }

    // Initialize: Set 'About Us' as the default active page on load
    setActivePage('about-us');

    // Add event listeners for navigation links
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const pageId = this.getAttribute('data-page');

            if (this.parentNode.classList.contains('dropdown-parent') && this.classList.contains('nav-item')) {
                // If it's the dropdown parent, toggle open/close
                this.parentNode.classList.toggle('open');
                // Also switch the page to the parent's default view
                setActivePage(pageId);
            } else if (pageId) {
                // If it's a direct link or a sub-link, switch the page
                setActivePage(pageId);
                
                // Close all other dropdowns
                document.querySelectorAll('.dropdown-parent').forEach(p => {
                    if (p !== this.parentNode) {
                        p.classList.remove('open');
                    }
                });
            }
        });
    });

    // --- CSV Publications Data Loading Logic ---
    async function loadPublicationsCSV() {
        // Check if data is already loaded to avoid re-fetching on every click
        if (PUBLICATIONS_TABLE_CONTAINER.querySelector('table')) {
            return;
        }

        PUBLICATIONS_TABLE_CONTAINER.innerHTML = '<p class="loading-message">Fetching data from GitHub...</p>';

        try {
            const response = await fetch(PUBLICATIONS_CSV_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const csvText = await response.text();
            renderTable(csvText);

        } catch (error) {
            console.error("Failed to load CSV file:", error);
            PUBLICATIONS_TABLE_CONTAINER.innerHTML = '<p class="loading-message" style="color: red;">Error: Could not load publications data. Check the GitHub file path.</p>';
        }
    }

    // Function to parse CSV text and generate HTML table
    function renderTable(csv) {
        // Split by newline, filtering out empty lines
        const allRows = csv.split(/\r?\n/).filter(row => row.trim() !== '');
        if (allRows.length <= 1) { // 1 row is just the header
            PUBLICATIONS_TABLE_CONTAINER.innerHTML = '<p class="loading-message">The CSV file is empty or contains only headers.</p>';
            return;
        }

        const table = document.createElement('table');
        const tbody = document.createElement('tbody');
        const thead = document.createElement('thead');

        // Split data by comma, respecting quoted fields (simple regex split)
        // This is a basic approach and might break on complex CSVs, but should work for clean data.
        const csvSplitter = (row) => row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(d => d.trim().replace(/^"|"$/g, ''));


        // Headers (First row of CSV)
        const headerRow = csvSplitter(allRows[0]);
        const headerTR = document.createElement('tr');
        headerRow.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerTR.appendChild(th);
        });
        thead.appendChild(headerTR);
        table.appendChild(thead);

        // Data Rows (Remaining rows)
        for (let i = 1; i < allRows.length; i++) {
            const data = csvSplitter(allRows[i]);
            
            // Skip if the row doesn't have the expected number of columns
            if (data.length !== headerRow.length) continue; 

            const tr = document.createElement('tr');

            data.forEach(cellData => {
                const td = document.createElement('td');
                td.textContent = cellData;
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        }

        PUBLICATIONS_TABLE_CONTAINER.innerHTML = ''; // Clear loading message
        table.appendChild(tbody);
        PUBLICATIONS_TABLE_CONTAINER.appendChild(table);
    }
    
    // --- Modal/Settings Logic ---
    const settingsBtn = document.getElementById('settings-btn');
    const modal = document.getElementById('settings-modal');
    const closeBtn = document.querySelector('.modal .close-btn');
    const settingTabs = document.querySelectorAll('.setting-tab');
    const settingsNavLinks = document.querySelectorAll('.settings-nav a');

    if (settingsBtn) {
        settingsBtn.onclick = function() { modal.style.display = "block"; }
    }
    if (closeBtn) {
        closeBtn.onclick = function() { modal.style.display = "none"; }
    }
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    }

    settingsNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const tabId = this.getAttribute('data-setting-tab');

            // Deactivate all links and tabs
            settingsNavLinks.forEach(l => l.classList.remove('active'));
            settingTabs.forEach(t => t.classList.remove('active'));

            // Activate current link and corresponding tab
            this.classList.add('active');
            document.getElementById(tabId + '-settings').classList.add('active');
        });
    });

    // --- Chatbot Logic ---
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotWindow = document.getElementById('chatbot-window');
    
    if (chatbotToggle && chatbotWindow) {
        // Chatbot window is hidden via CSS, but we can manage it with JS
        chatbotToggle.addEventListener('click', () => {
            if (chatbotWindow.style.display === 'none' || chatbotWindow.style.display === '') {
                chatbotWindow.style.display = 'flex';
            } else {
                chatbotWindow.style.display = 'none';
            }
        });
    }

});
