document.addEventListener('DOMContentLoaded', () => {

    // --- DATA ---
    // Data scraped from https://github.com/jgalazka/SB_publications/blob/main/README.md
    const publicationsData = [
        { title: "Metabolic and physiological responses of Cupriavidus metallidurans CH34 to spaceflight.", link: "https://doi.org/10.1038/s41526-020-00128-3", authors: "Leys, N., et al.", year: 2020 },
        { title: "Draft Genome Sequences of Three Fungal Isolates from the International Space Station.", link: "https://doi.org/10.1128/genomeA.01077-18", authors: "Sielaff, A. C., et al.", year: 2018 },
        { title: "A new path for the evolution of metallic-like conductivity in bacteria.", link: "https://doi.org/10.1186/s12915-018-0524-8", authors: "Strycharz-Glaven, S. M., et al.", year: 2018 },
        { title: "Genomic and phenotypic characterization of a virulent, antibiotic-resistant Klebsiella pneumoniae.", link: "https://doi.org/10.1128/mSystems.00293-19", authors: "Ratchford, A. N., et al.", year: 2020 },
        { title: "Identification of a novel biosynthetic gene cluster for the synthesis of 2,5-dialkylresorcinols.", link: "https://doi.org/10.1128/AEM.01053-18", authors: "El-Hefnawy, M., et al.", year: 2018 },
        { title: "Draft Genome Sequences of Three Penicillium Species Isolated from the International Space Station.", link: "https://doi.org/10.1128/genomeA.01073-18", authors: "Sielaff, A. C., et al.", year: 2018 },
        { title: "The power of synthetic biology for bioproduction, remediation and medicine.", link: "https://doi.org/10.1038/s41467-020-14331-8", authors: "French, K. E., et al.", year: 2020 }
        // ...add more publications if needed
    ];

    // --- STATE MANAGEMENT ---
    let navigationHistory = [];

    // --- ELEMENT SELECTORS ---
    const userTypeScreen = document.getElementById('user-type-selection-screen');
    const mainApp = document.getElementById('main-app');
    const userTypeBoxes = document.querySelectorAll('.user-type-box');
    const navLinks = document.querySelectorAll('.nav-link, .nav-link-button');
    const contentPages = document.querySelectorAll('.page-content');
    const backButton = document.getElementById('back-button');
    const chatbotButton = document.getElementById('chatbot-button');
    const settingsLink = document.getElementById('settings-link');
    const userProfileLink = document.getElementById('user-profile-link');
    const publicationsListContainer = document.getElementById('publications-list-container');
    const publicationSearchInput = document.getElementById('publication-search');

    // --- FUNCTIONS ---
    
    /**
     * Hides all content pages and shows the specified page.
     * @param {string} pageId - The ID of the page to show (e.g., 'home', 'about').
     */
    function showPage(pageId) {
        // Hide all pages
        contentPages.forEach(page => page.classList.add('hidden'));
        
        // Show the target page
        const targetPage = document.getElementById(`page-${pageId}`);
        if (targetPage) {
            targetPage.classList.remove('hidden');
        }

        // Update active nav link
        navLinks.forEach(link => {
            if (link.dataset.page === pageId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
        
        // Add to history if it's a new page
        if (navigationHistory[navigationHistory.length - 1] !== pageId) {
            navigationHistory.push(pageId);
        }
    }

    /**
     * Navigates to the previous page in the history stack.
     */
    function navigateBack() {
        if (navigationHistory.length > 1) {
            navigationHistory.pop(); // Remove the current page
            const previousPage = navigationHistory[navigationHistory.length - 1]; // Get the new last page
            showPage(previousPage);
        } else {
            // If only one or zero items left, go to home
            showPage('home');
        }
    }
    
    /**
     * Renders the list of publications, optionally filtered by a search term.
     * @param {string} filter - The search term to filter titles.
     */
    function renderPublications(filter = '') {
        publicationsListContainer.innerHTML = ''; // Clear existing list
        const lowercasedFilter = filter.toLowerCase();

        const filteredData = publicationsData.filter(pub => 
            pub.title.toLowerCase().includes(lowercasedFilter)
        );

        if (filteredData.length === 0) {
            publicationsListContainer.innerHTML = '<p>No publications found.</p>';
            return;
        }

        filteredData.forEach(pub => {
            const pubElement = document.createElement('div');
            pubElement.className = 'publication-item';
            pubElement.innerHTML = `
                <h4>${pub.title}</h4>
                <p><strong>Authors:</strong> ${pub.authors}</p>
                <p><strong>Year:</strong> ${pub.year}</p>
                <a href="${pub.link}" target="_blank">View Publication</a>
            `;
            publicationsListContainer.appendChild(pubElement);
        });
    }

    // --- EVENT LISTENERS ---

    // User Type Selection
    userTypeBoxes.forEach(box => {
        box.addEventListener('click', () => {
            userTypeScreen.classList.add('hidden');
            mainApp.classList.remove('hidden');
            showPage('home'); // Show the home page after selection
        });
    });

    // Main Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.dataset.page;
            if (pageId) {
                showPage(pageId);
            }
        });
    });

    // Back Button
    backButton.addEventListener('click', navigateBack);

    // Publication Search
    publicationSearchInput.addEventListener('input', (e) => {
        renderPublications(e.target.value);
    });

    // Placeholder alerts for other buttons
    chatbotButton.addEventListener('click', () => alert('Chatbot clicked!'));
    settingsLink.addEventListener('click', () => alert('Settings clicked!'));
    userProfileLink.addEventListener('click', () => alert('User Profile / Login clicked!'));
    document.getElementById('publication-form').addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Publication submitted (demo)!');
    });

    // --- INITIALIZATION ---
    renderPublications(); // Initial render of all publications

});
