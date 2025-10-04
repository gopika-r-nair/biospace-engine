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
    // 3. Content Section Switching Logic
    // ------------------------------------
    const navItems = document.querySelectorAll('.nav-list .nav-item, .sub-menu li');
    const contentSections = document.querySelectorAll('.content-section');

    function showSection(sectionId) {
        contentSections.forEach(section => {
            section.classList.add('hidden');
            section.classList.remove('active');
        });
        const targetSection = document.getElementById(sectionId + '-section');
        if (targetSection) {
            targetSection.classList.remove('hidden');
            targetSection.classList.add('active');
        }
    }

    function activateNavItem(targetLi) {
        // Remove active from all main nav items and sub-menu items
        document.querySelectorAll('.nav-list .nav-item, .sub-menu li').forEach(item => {
            item.classList.remove('active');
        });

        // Add active to the clicked item
        if (targetLi) {
            targetLi.classList.add('active');
            // Ensure the main parent item is active if a sub-item is clicked
            const parentItem = targetLi.closest('.nav-item.has-dropdown');
            if (parentItem) {
                 // Important: Do NOT make the parent active if a sub-item is active, 
                 // as the wireframe shows the parent active even if a sub-item is selected.
                 // This is handled automatically since the parent LI is selected in the CSS.
            }
        }
    }

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const clickedLi = e.target.closest('li');
            if (!clickedLi) return;
            const sectionId = clickedLi.dataset.section;

            if (sectionId) {
                // Close all other dropdowns if clicking a different main section
                if (clickedLi.classList.contains('nav-item') && !clickedLi.classList.contains('has-dropdown')) {
                    document.querySelectorAll('.nav-item.has-dropdown.open').forEach(openItem => {
                        openItem.classList.remove('open');
                        openItem.querySelector('.sub-menu').style.maxHeight = null;
                    });
                }
                
                showSection(sectionId);
                activateNavItem(clickedLi);
            }
        });
    });

    // Handle back buttons (for sub-sections)
    document.querySelectorAll('.back-btn').forEach(button => {
        button.addEventListener('click', () => {
            const parentSectionId = button.dataset.parent;
            if (parentSectionId) {
                showSection(parentSectionId);
                
                // Set the parent navigation item as active
                const parentNavItem = document.querySelector(`.nav-item[data-section="${parentSectionId}"]`);
                activateNavItem(parentNavItem);
            }
        });
    });

    // Initial load: show the publications section and mark it active
    showSection('publications');
    activateNavItem(document.querySelector('.nav-item[data-section="publications"]'));

});
