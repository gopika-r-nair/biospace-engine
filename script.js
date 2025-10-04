document.addEventListener('DOMContentLoaded', () => {
    // ------------------------------------
    // 1. Chatbot Toggle Functionality
    // ------------------------------------
    const chatbotTrigger = document.getElementById('chatbot-trigger');
    const chatbotPopup = document.getElementById('chatbot-popup');

    if (chatbotTrigger && chatbotPopup) {
        chatbotTrigger.addEventListener('click', () => {
            chatbotPopup.classList.toggle('hidden');

            const icon = chatbotTrigger.querySelector('i');
            if (chatbotPopup.classList.contains('hidden')) {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-question');
            } else {
                icon.classList.remove('fa-question');
                icon.classList.add('fa-times');
            }
        });
    }

    // ------------------------------------
    // 2. Sidebar Dropdown Functionality
    // ------------------------------------
    const dropdownItems = document.querySelectorAll('.nav-item.has-dropdown > a');

    dropdownItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            const parentLi = item.parentElement;
            const subMenu = parentLi.querySelector('.sub-menu');
            const dropdownIcon = parentLi.querySelector('.dropdown-icon');

            // Toggle active/open class on the parent list item
            parentLi.classList.toggle('open');

            if (subMenu.style.maxHeight) {
                subMenu.style.maxHeight = null;
            } else {
                // Set max-height to scrollHeight for smooth transition
                subMenu.style.maxHeight = subMenu.scrollHeight + "px";
            }
        });
    });

    // ------------------------------------
    // 3. Content Section Switching
    // ------------------------------------
    const navItems = document.querySelectorAll('.nav-list .nav-item, .sub-menu li');
    const contentSections = document.querySelectorAll('.content-section');

    function showSection(sectionId) {
        contentSections.forEach(section => {
            section.classList.add('hidden'); // Hide all
            section.classList.remove('active');
        });
        const targetSection = document.getElementById(sectionId + '-section');
        if (targetSection) {
            targetSection.classList.remove('hidden'); // Show target
            targetSection.classList.add('active');
        }
    }

    function activateNavItem(targetLi) {
        // Remove active from all main nav items
        document.querySelectorAll('.nav-list > .nav-item').forEach(item => {
            item.classList.remove('active');
        });
        // Remove active from all sub-menu items
        document.querySelectorAll('.sub-menu li').forEach(item => {
            item.classList.remove('active');
        });

        // Add active to the clicked item
        if (targetLi) {
            targetLi.classList.add('active');
            // If it's a sub-menu item, also make its parent main nav item active
            if (targetLi.closest('.sub-menu')) {
                targetLi.closest('.nav-item.has-dropdown').classList.add('active');
            }
        }
    }


    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // Find the actual <li> element, whether it's the nav-item itself or its parent if clicking the link
            const clickedLi = e.target.closest('li');
            if (!clickedLi) return; // Should not happen if event listener is on .nav-item or .sub-menu li

            const sectionId = clickedLi.dataset.section;

            // Only switch content if a data-section is defined
            if (sectionId) {
                showSection(sectionId);
                activateNavItem(clickedLi);
            }
        });
    });

    // Handle back buttons
    document.querySelectorAll('.back-btn').forEach(button => {
        button.addEventListener('click', () => {
            const currentActiveSection = document.querySelector('.content-section.active');
            let parentSectionId = null;

            // Define parent sections for sub-sections
            if (currentActiveSection.id === 'interactivities-section' || currentActiveSection.id === 'events-section') {
                parentSectionId = 'activities';
            } else if (currentActiveSection.id === 'life-at-nasa-section' || currentActiveSection.id === 'future-studies-section') {
                parentSectionId = 'career';
            }

            if (parentSectionId) {
                showSection(parentSectionId);
                activateNavItem(document.querySelector(`.nav-item[data-section="${parentSectionId}"]`));
            } else {
                // If no specific parent, could go to a default or previous section
                // For now, let's just make the back button functional for the specific sub-sections
                console.log("No explicit parent section defined for this back button.");
            }
        });
    });


    // Initial load: show the publications section and mark it active
    showSection('publications');
    activateNavItem(document.querySelector('.nav-item[data-section="publications"]'));

});
