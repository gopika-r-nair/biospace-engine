const views = document.querySelectorAll('.view');
const header = document.getElementById('universal-header');
const footer = document.getElementById('app-footer');
let history = []; // To store navigation history

// --- CHATBOT ELEMENTS ---
const chatbotModal = document.getElementById('chatbot-modal');
const chatbotButton = document.getElementById('chatbot-button');
const closeChatbotButton = document.getElementById('close-chatbot');
const userInput = document.getElementById('user-input');
const sendMessageButton = document.getElementById('send-message');
const chatbotMessages = document.getElementById('chatbot-messages');
// Note: We'll select the AI card button inside DOMContentLoaded

// --- Helper Functions ---
function handlePlaceholderClick(featureName) {
    alert(`This feature (${featureName}) is a design placeholder and is not functional.`);
}

// --- Navigation Functions ---
function navigateTo(targetId) {
    // 1. Deactivate all views
    views.forEach(view => {
        view.classList.remove('active');
    });
    
    // 2. Activate the target view
    const targetView = document.getElementById(targetId);
    if (targetView) {
        targetView.classList.add('active');
        
        // 3. Update visibility of header/footer
        if (targetId === 'view-user-select') {
            header.classList.add('hidden');
            footer.classList.add('hidden');
            history = []; // Clear history on returning to select screen
        } else {
            header.classList.remove('hidden');
            footer.classList.remove('hidden');
            
            // 4. Update history (only push if it's a new page)
            if (history[history.length - 1] !== targetId) {
                history.push(targetId);
            }
        }

        // 5. Update active class on main navigation links
        document.querySelectorAll('.main-nav a').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-target') === targetId) {
                link.classList.add('active');
            }
        });
        
        window.scrollTo(0, 0); // Scroll to top of the new page
    }
}

function goBack() {
    if (history.length > 1) {
        history.pop(); // Remove current view
        const previousViewId = history[history.length - 1];
        // Navigate to the previous view
        navigateTo(previousViewId);
        // Correct history: navigateTo adds the previousViewId back, so we keep the length correct
        history.pop();
        history.push(previousViewId);
    } else {
        // Fallback to dashboard or user select
        navigateTo('view-user-select');
    }
}

// --- Chatbot Functions ---

function toggleChatbot() {
    chatbotModal.classList.toggle('hidden');
    // Scroll to bottom on open and focus input
    if (!chatbotModal.classList.contains('hidden')) {
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        userInput.focus();
    }
}

function createMessageElement(message, isOutgoing) {
    const msgElement = document.createElement('div');
    msgElement.classList.add('message', isOutgoing ? 'outgoing' : 'incoming');
    msgElement.textContent = message;
    return msgElement;
}

function getBotResponse(userMessage) {
    const msg = userMessage.toLowerCase().trim();

    // Rule-based responses for key portal features
    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
        return "Hello! I'm your EXBIO Portal Assistant. I can help you navigate. Try asking about 'Publications', 'Activities', or 'Careers'.";
    } else if (msg.includes('publications') || msg.includes('pub')) {
        return "The Publications Directory provides a list of research papers. You can search by title or DOI and find links to external resources like the NASA Task Book.";
    } else if (msg.includes('activities') || msg.includes('workshop') || msg.includes('campaign')) {
        return "The Activities page details upcoming workshops (like data analysis workshops) and field campaigns (analog missions). Check there for application deadlines!";
    } else if (msg.includes('manager') || msg.includes('architect') || msg.includes('mission')) {
        return "As a Mission Architect, you can access specialized resources via the Library and use our Interactives to run simulations on bio-systems.";
    } else if (msg.includes('career') || msg.includes('job') || msg.includes('qualifications')) {
        return "The Career section outlines potential employers (NASA, ESA, Private Aerospace) and required qualifications in space biology and bioengineering.";
    } else if (msg.includes('library') || msg.includes('books')) {
        return "The Library organizes resources into Books, Journals, and Past Papers. It also links to the NASA Space Life Sciences Library (NSLSL).";
    } else if (msg.includes('osdr') || msg.includes('data')) {
        return "The NASA Open Science Data Repository (OSDR) is where you find raw space biology data. Links are available on the Dashboard and Publications pages.";
    } else if (msg.includes('thanks') || msg.includes('thank you')) {
        return "You're very welcome! Safe travels in the EXBIO Portal.";
    } else {
        return "I'm sorry, I currently only have pre-programmed answers for key portal topics like 'Publications', 'Activities', or 'Library'.";
    }
}

function handleSendMessage() {
    const userMessage = userInput.value.trim();
    if (userMessage === "") return;

    // 1. Display user message
    chatbotMessages.appendChild(createMessageElement(userMessage, true));
    userInput.value = '';
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

    // 2. Simulate bot typing/thinking delay
    const thinkingMessage = createMessageElement("Thinking...", false);
    chatbotMessages.appendChild(thinkingMessage);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

    // 3. Get and display bot response after delay
    setTimeout(() => {
        const botResponse = getBotResponse(userMessage);
        thinkingMessage.textContent = botResponse;
        // Scroll again after content is loaded
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }, 800);
}

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    // Initial view setup
    navigateTo('view-user-select');

    // Navigation setup
    document.getElementById('back-button').addEventListener('click', goBack);
    document.querySelectorAll('.main-nav .nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(link.getAttribute('data-target'));
        });
    });

    // User Type Selection Listener (Crucial for initial flow)
    document.querySelectorAll('.user-type-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const targetId = card.getAttribute('data-target');
            if (targetId) {
                // Navigate to the dashboard after selecting user type
                navigateTo(targetId); 
            }
        });
    });
    
    // --- Chatbot Event Listeners ---
    
    // Add the initial welcome message to the chatbot
    const initialMessage = "Welcome! I can help you navigate the EXBIO Portal. Ask me about 'Publications', 'Activities', or 'Careers'.";
    chatbotMessages.appendChild(createMessageElement(initialMessage, false));

    // Floating button and close button toggle the modal
    chatbotButton.addEventListener('click', toggleChatbot);
    closeChatbotButton.addEventListener('click', toggleChatbot);
    
    // Send button triggers the chat handlers
    sendMessageButton.addEventListener('click', handleSendMessage);
    
    // Allow 'Enter' key to send message
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
            e.preventDefault(); // Prevent new line in input field
        }
    });
    
    // Link the AI help card button to open the chatbot modal
    const aiHelpCardButton = document.querySelector('.ai-help-card .primary-button');
    if (aiHelpCardButton) {
        aiHelpCardButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (chatbotModal.classList.contains('hidden')) {
                toggleChatbot();
            }
        });
    }
});

// Expose handlePlaceholderClick globally for use in HTML onclick attributes
window.handlePlaceholderClick = handlePlaceholderClick;
window.toggleChatbot = toggleChatbot; // Expose toggleChatbot for the AI card button
