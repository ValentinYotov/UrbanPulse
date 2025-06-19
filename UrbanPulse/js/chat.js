const chatList = document.getElementById('chat-list');
const newChatBtn = document.getElementById('new-chat-btn');
const chatWindow = document.getElementById('chat-window');
const sendButton = document.getElementById('send-button');
const userInput = document.getElementById('user-input');

let chats = [];
let currentChatId = null;

function renderChatList() {
    if (!chatList) return;
    chatList.innerHTML = '';
    chats.forEach(chat => {
        const li = document.createElement('li');
        li.style.display = 'flex';
        li.style.alignItems = 'center';
        li.style.justifyContent = 'space-between';
        li.style.background = chat.id === currentChatId ? '#222' : 'transparent';
        li.style.borderRadius = '4px';
        li.style.padding = '4px 8px';
        li.style.cursor = 'pointer';
        li.title = chat.title;

        const titleSpan = document.createElement('span');
        titleSpan.textContent = chat.title || 'New Chat';
        titleSpan.style.flexGrow = '1';
        titleSpan.onclick = () => selectChat(chat.id);

        const delBtn = document.createElement('button');
        delBtn.title = 'Delete Chat';
        delBtn.style.background = 'none';
        delBtn.style.border = 'none';
        delBtn.style.color = '#ff4d4d';
        delBtn.style.cursor = 'pointer';
        delBtn.style.display = 'flex';
        delBtn.style.alignItems = 'center';
        delBtn.style.fontSize = '1.1em';
        // FontAwesome иконка
        const trashIcon = document.createElement('i');
        trashIcon.className = 'fas fa-trash-alt';
        trashIcon.style.pointerEvents = 'none';
        delBtn.appendChild(trashIcon);
        delBtn.onclick = (e) => { e.stopPropagation(); deleteChat(chat.id); };

        li.appendChild(titleSpan);
        li.appendChild(delBtn);
        chatList.appendChild(li);
    });
}

function renderMessages(messages) {
    if (!chatWindow) return;
    chatWindow.innerHTML = '';
    if (!messages || messages.length === 0) {
        const msg = document.createElement('div');
        msg.className = 'message ai';
        msg.textContent = 'Hello! How can I help you today?';
        chatWindow.appendChild(msg);
        return;
    }
    messages.forEach(m => {
        const msg = document.createElement('div');
        msg.className = 'message ' + (m.sender === 'user' ? 'user' : 'ai');
        msg.textContent = m.text;
        chatWindow.appendChild(msg);
    });
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function loadChats() {
    // Само от паметта
    renderChatList();
    if (chats.length > 0) {
        selectChat(chats[0].id);
    } else {
        currentChatId = null;
        renderMessages([]);
    }
}

function selectChat(chatId) {
    currentChatId = chatId;
    renderChatList();
    const chat = chats.find(c => c.id === chatId);
    renderMessages(chat && chat.messages ? chat.messages : []);
}

function createNewChat() {
    const newChat = {
        id: 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        title: 'New Chat',
        messages: []
    };
    chats.unshift(newChat);
    loadChats();
    selectChat(newChat.id);
}

function deleteChat(chatId) {
    chats = chats.filter(c => c.id !== chatId);
    loadChats();
}

function saveMessageToChat(sender, text) {
    // Ако няма избран чат, създай нов
    if (!currentChatId) {
        createNewChat();
    }
    const chat = chats.find(c => c.id === currentChatId);
    if (!chat) return;
    // Ако това е първото user съобщение, преименувай чата
    if (chat.messages.length === 0 && sender === 'user') {
        chat.title = text.length > 30 ? text.substring(0, 30) + '...' : text;
    }
    chat.messages.push({ sender, text, timestamp: Date.now() });
    renderMessages(chat.messages);
    renderChatList();
}

if (newChatBtn) newChatBtn.addEventListener('click', createNewChat);
if (sendButton) sendButton.addEventListener('click', async () => {
    const message = userInput.value.trim();
    if (!message) return;
    saveMessageToChat('user', message);
});

// Зареждаме чатовете при зареждане на страницата
window.addEventListener('DOMContentLoaded', loadChats);

export { saveMessageToChat }; 