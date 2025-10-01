/**
 * ===================================================================
 * SPA NAVIGATION LOGIC
 * ===================================================================
 */

let viewHistory = ['view-user-select'];
let currentView = 'view-user-select';
const header = document.getElementById('universal-header');
const footer = document.getElementById('app-footer'); // NEW: Reference to the footer
const viewsContainer = document.getElementById('views-container');

/**
 * Switches the displayed view/screen.
 * @param {string} targetViewId - The ID of the view to navigate to (e.g., 'view-dashboard').
 */
function navigateTo(targetViewId) {
    if (targetViewId === currentView) return;

    // ... (View History logic remains unchanged) ...
    if (targetViewId !== 'view-user-select') {
        if (viewHistory.length === 0 || viewHistory[viewHistory.length - 1] !== currentView) {
            viewHistory.push(currentView);
        }
        if (currentView === 'view-dashboard' && viewHistory[viewHistory.length - 1] !== 'view-dashboard') {
             viewHistory.push('view-dashboard');
        }
    } else {
        viewHistory = ['view-user-select'];
    }
    
    // Hide current view and show the target view
    const activeView = viewsContainer.querySelector('.view.active');
    if (activeView) {
        activeView.classList.remove('active');
    }

    const targetView = document.getElementById(targetViewId);
    if (targetView) {
        targetView.classList.add('active');
        currentView = targetViewId;
        window.scrollTo(0, 0); 
    }

    // NEW: Toggle Universal Header and Footer visibility together
    if (targetViewId === 'view-user-select') {
        header.classList.add('hidden');
        footer.classList.add('hidden');
    } else {
        header.classList.remove('hidden');
        footer.classList.remove('hidden');
    }

    // Update Back button state
    updateBackButton();

    // Update main navigation active state
    updateMainNav(targetViewId);

    console.log('Navigated to:', currentView, 'History:', viewHistory);
}

/**
 * Handles the universal "Back" button functionality.
 */
function goBack() {
    // ... (goBack logic remains unchanged) ...
    if (viewHistory.length <= 1) {
        if (currentView !== 'view-dashboard') {
             navigateTo('view-dashboard');
        }
        return;
    }

    viewHistory.pop(); 
    const previousViewId = viewHistory[viewHistory.length - 1]; 
    
    const activeView = viewsContainer.querySelector('.view.active');
    if (activeView) {
        activeView.classList.remove('active');
    }

    const targetView = document.getElementById(previousViewId);
    if (targetView) {
        targetView.classList.add('active');
        currentView = previousViewId;
        window.scrollTo(0, 0); 
    }

    updateBackButton();
    updateMainNav(previousViewId);

    console.log('Went Back to:', currentView, 'History:', viewHistory);
}

/**
 * Updates the visual state of the back button.
 */
function updateBackButton() {
    const isRootView = currentView === 'view-dashboard' || currentView === 'view-user-select';
    const backButton = document.getElementById('back-button');

    if (currentView === 'view-user-select') {
         backButton.style.opacity = '0';
         backButton.style.pointerEvents = 'none';
    } else if (isRootView) {
        backButton.style.opacity = '0.5';
        backButton.style.pointerEvents = 'none';
    } else {
        backButton.style.opacity = '1';
        backButton.style.pointerEvents = 'auto';
    }
}

/**
 * Updates the 'active' class on the main navigation links.
 */
function updateMainNav(activeViewId) {
    const navLinks = document.querySelectorAll('.main-nav .nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (activeViewId.includes(link.getAttribute('data-target').replace('view-', ''))) {
            link.classList.add('active');
        }
    });
}

// Attach event listeners after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial Load: Ensure only the first view is shown (and header/footer are hidden)
    navigateTo('view-user-select'); 

    // 2. User Type Selection Click Handler
    document.querySelectorAll('.user-type-card').forEach(card => {
        card.addEventListener('click', (e) => {
            navigateTo('view-dashboard');
        });
    });

    // 3. Universal Back Button Handler
    document.getElementById('back-button').addEventListener('click', goBack);

    // 4. Main Navigation Links Handler
    document.querySelectorAll('.main-nav .nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('data-target');
            if (target) {
                navigateTo(target);
            }
        });
    });
});


/**
 * ===================================================================
 * PLACEHOLDER FUNCTIONS
 * ===================================================================
 */
function handlePlaceholderClick(featureName) {
    alert(`[${featureName} Functionality]: This feature would be implemented here. For now, this is a placeholder.`);
}
