/**
 * ===================================================================
 * SPA NAVIGATION LOGIC
 * ===================================================================
 */

// Global variable to track the navigation history for the 'Back' button
let viewHistory = ['view-user-select'];
let currentView = 'view-user-select';
const header = document.getElementById('universal-header');
const viewsContainer = document.getElementById('views-container');

/**
 * Switches the displayed view/screen.
 * @param {string} targetViewId - The ID of the view to navigate to (e.g., 'view-dashboard').
 */
function navigateTo(targetViewId) {
    if (targetViewId === currentView) return;

    // 1. Update View History (Only for non-initial screens)
    if (targetViewId !== 'view-user-select') {
        // Only push to history if not navigating back
        if (viewHistory.length === 0 || viewHistory[viewHistory.length - 1] !== currentView) {
            viewHistory.push(currentView);
        }
        // If coming from a direct link on dashboard, ensure 'view-dashboard' is the immediate predecessor
        if (currentView === 'view-dashboard' && viewHistory[viewHistory.length - 1] !== 'view-dashboard') {
             viewHistory.push('view-dashboard');
        }
    } else {
        // Clear history when going back to the user select screen
        viewHistory = ['view-user-select'];
    }
    
    // 2. Hide current view and show the target view
    const activeView = viewsContainer.querySelector('.view.active');
    if (activeView) {
        activeView.classList.remove('active');
    }

    const targetView = document.getElementById(targetViewId);
    if (targetView) {
        targetView.classList.add('active');
        currentView = targetViewId;
        
        // Scroll to the top of the new view
        window.scrollTo(0, 0); 
    }

    // 3. Toggle Universal Header visibility
    if (targetViewId === 'view-user-select') {
        header.classList.add('hidden');
    } else {
        header.classList.remove('hidden');
    }

    // 4. Update Back button state
    updateBackButton();

    // 5. Update main navigation active state
    updateMainNav(targetViewId);

    console.log('Navigated to:', currentView, 'History:', viewHistory);
}

/**
 * Handles the universal "Back" button functionality.
 * Navigates to the logically previous screen in the history.
 */
function goBack() {
    if (viewHistory.length <= 1) {
        // If only 'view-user-select' is in history, we're at the root, do nothing or go to dashboard
        if (currentView !== 'view-dashboard') {
             navigateTo('view-dashboard');
        }
        return;
    }

    // Remove the current view from history
    viewHistory.pop(); 
    
    // Get the previous view from history
    const previousViewId = viewHistory[viewHistory.length - 1]; 
    
    // Switch to the previous view, but DO NOT push it back onto history
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
 * The button is always visible on the header, but its function is managed by history.
 */
function updateBackButton() {
    // Check if the current view is 'view-dashboard' or 'view-user-select' (the logical roots)
    const isRootView = currentView === 'view-dashboard' || currentView === 'view-user-select';
    const backButton = document.getElementById('back-button');

    if (currentView === 'view-user-select') {
         // The header is hidden anyway, but for robustness
         backButton.style.opacity = '0';
         backButton.style.pointerEvents = 'none';
    } else if (isRootView) {
        // If we are at the dashboard, disable/hide the back button
        backButton.style.opacity = '0.5';
        backButton.style.pointerEvents = 'none';
    } else {
        // For all other pages, enable it
        backButton.style.opacity = '1';
        backButton.style.pointerEvents = 'auto';
    }
}

/**
 * Updates the 'active' class on the main navigation links.
 * @param {string} activeViewId - The ID of the current active view.
 */
function updateMainNav(activeViewId) {
    const navLinks = document.querySelectorAll('.main-nav .nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        // Check if the link's data-target matches the current view ID
        // Note: We check if the activeViewId CONTAINS the link's target, to highlight
        // 'Publications' when on 'view-submit-publication', for example.
        if (activeViewId.includes(link.getAttribute('data-target').replace('view-', ''))) {
            link.classList.add('active');
        }
    });
}

// Attach event listeners after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial Load: Ensure only the first view is shown
    navigateTo('view-user-select'); 

    // 2. User Type Selection Click Handler
    document.querySelectorAll('.user-type-card').forEach(card => {
        card.addEventListener('click', (e) => {
            // Navigate to the Dashboard after selection
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
 * Handles clicks for non-implemented features like Settings, Chatbot, etc.
 * ===================================================================
 */
function handlePlaceholderClick(featureName) {
    alert(`[${featureName} Functionality]: This feature would be implemented here. For now, this is a placeholder.`);
}
