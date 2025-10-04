document.addEventListener('DOMContentLoaded', () => {
    // ------------------------------------
    // 1. Chatbot Toggle Functionality
    // ------------------------------------
    const chatbotTrigger = document.getElementById('chatbot-trigger');
    const chatbotPopup = document.getElementById('chatbot-popup');

    if (chatbotTrigger && chatbotPopup) {
        chatbotTrigger.addEventListener('click', () => {
            // Toggles the 'hidden' class on the popup
            chatbotPopup.classList.toggle('hidden');

            // Optional: change the button icon when active
            const icon = chatbotTrigger.querySelector('i');
            if (chatbotPopup.classList.contains('hidden')) {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-question');
            } else {
                icon.classList.remove('fa-question');
                icon.classList.add('fa-times'); // Use 'X' icon when open
            }
        });
    }


    // ------------------------------------
    // 2. Sidebar Dropdown Functionality
    // ------------------------------------
    const dropdownItems = document.querySelectorAll('.nav-item.has-dropdown > a');

    dropdownItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault(); // Stop the link from navigating

            const parentLi = item.parentElement;
            const subMenu = parentLi.querySelector('.sub-menu');
            const dropdownIcon = parentLi.querySelector('.dropdown-icon');

            if (subMenu.style.maxHeight) {
                // If the sub-menu is open, close it
                subMenu.style.maxHeight = null;
                dropdownIcon.style.transform = 'rotate(0deg)';
                parentLi.classList.remove('open');
            } else {
                // Close all other open sub-menus first
                document.querySelectorAll('.sub-menu').forEach(menu => {
                    menu.style.maxHeight = null;
                    menu.parentElement.classList.remove('open');
                    menu.parentElement.querySelector('.dropdown-icon').style.transform = 'rotate(0deg)';
                });

                // Open the current sub-menu
                // We use scrollHeight to get the correct height for the transition
                subMenu.style.maxHeight = subMenu.scrollHeight + "px";
                dropdownIcon.style.transform = 'rotate(180deg)';
                parentLi.classList.add('open');
            }
        });
    });

});
