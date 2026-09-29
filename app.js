const STORAGE_KEY = "linkbridge_state";

const defaultState = {
    currentUserId: "admin-1",

    users: [
        {
            id: "admin-1",
            firstName: "Andre",
            lastName: "Duque",
            username: "andre",
            role: "admin",
            status: "online"
        }
    ],

    conversations: {}
};


// =========================
// STATE
// =========================

function loadState() {
    const savedState = localStorage.getItem(STORAGE_KEY);

    if (!savedState) {
        return structuredClone(defaultState);
    }

    try {
        return JSON.parse(savedState);
    } catch (error) {
        console.error(
            "Could not load saved LinkBridge state:",
            error
        );

        return structuredClone(defaultState);
    }
}


let state = loadState();


function saveState() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(state)
    );
}


// =========================
// DOM ELEMENTS
// =========================

const userList =
    document.getElementById("userList");

const messages =
    document.getElementById("messages");

const chatName =
    document.getElementById("chatName");

const chatStatus =
    document.getElementById("chatStatus");

const messageInput =
    document.getElementById("messageInput");

const sendButton =
    document.getElementById("sendButton");

const adminButton =
    document.getElementById("adminButton");

const adminModal =
    document.getElementById("adminModal");

const closeAdminButton =
    document.getElementById("closeAdminButton");

const createUserForm =
    document.getElementById("createUserForm");

const adminUserList =
    document.getElementById("adminUserList");

const currentUserName =
    document.getElementById("currentUserName");

const currentUserRole =
    document.getElementById("currentUserRole");

const currentUserAvatar =
    document.getElementById("currentUserAvatar");


// =========================
// HELPERS
// =========================

function getCurrentUser() {
    return state.users.find(
        user => user.id === state.currentUserId
    );
}


function getUser(userId) {
    return state.users.find(
        user => user.id === userId
    );
}


function getUserFullName(user) {
    return `${user.firstName} ${user.lastName}`;
}


function getInitials(user) {
    const first =
        user.firstName?.charAt(0) || "";

    const last =
        user.lastName?.charAt(0) || "";

    return `${first}${last}`.toUpperCase();
}


function escapeHtml(text) {
    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


function getConversation(userId) {
    if (!state.conversations[userId]) {
        state.conversations[userId] = [];
    }

    return state.conversations[userId];
}


// =========================
// CURRENT USER
// =========================

function renderCurrentUser() {
    const user = getCurrentUser();

    if (!user) {
        return;
    }

    currentUserName.textContent =
        getUserFullName(user);

    currentUserRole.textContent =
        user.role === "admin"
            ? "Admin"
            : "User";

    currentUserAvatar.textContent =
        getInitials(user);

    if (user.role === "admin") {
        adminButton.style.display = "block";
    } else {
        adminButton.style.display = "none";
    }
}


// =========================
// USER LIST
// =========================

function renderUsers() {
    userList.innerHTML = "";

    const users = state.users.filter(
        user => user.id !== state.currentUserId
    );

    if (users.length === 0) {
        userList.innerHTML = `
            <div class="empty-users">
                <div class="empty-users-icon">?</div>
                <p>No other users yet.</p>
                <span>Create users from the Admin panel.</span>
            </div>
        `;

        return;
    }

    users.forEach(user => {
        const element =
            document.createElement("div");

        element.className = "user-item";

        if (
            user.id === state.activeConversationUserId
        ) {
            element.classList.add("active");
        }

        const conversation =
            getConversation(user.id);

        const lastMessage =
            conversation.length > 0
                ? conversation[
                    conversation.length - 1
                  ].text
                : "No messages yet";

        element.innerHTML = `
            <div class="avatar">
                ${escapeHtml(getInitials(user))}
            </div>

            <div class="user-info-list">
                <span class="user-name">
                    ${escapeHtml(getUserFullName(user))}
                </span>

                <span class="user-preview">
                    ${escapeHtml(lastMessage)}
                </span>
            </div>
        `;

        element.addEventListener(
            "click",
            () => {
                openConversation(user.id);
            }
        );

        userList.appendChild(element);
    });
}


// =========================
// CONVERSATIONS
// =========================

function openConversation(userId) {
    const user = getUser(userId);

    if (!user) {
        return;
    }

    state.activeConversationUserId = userId;

    saveState();

    renderUsers();
    renderChat();
}


function renderChat() {
    const user =
        getUser(state.activeConversationUserId);

    if (!user) {
        chatName.textContent =
            "Select a user";

        chatStatus.textContent =
            "Choose a user from the list";

        messages.innerHTML = `
            <div class="empty-chat">
                <div class="empty-chat-icon">💬</div>
                <h3>Select a user</h3>
                <p>
                    Choose a user from the left
                    to start a conversation.
                </p>
            </div>
        `;

        messageInput.disabled = true;
        sendButton.disabled = true;

        return;
    }

    messageInput.disabled = false;
    sendButton.disabled = false;

    chatName.textContent =
        getUserFullName(user);

    chatStatus.textContent =
        user.status === "online"
            ? "Online"
            : "Offline";

    messages.innerHTML = "";

    const conversation =
        getConversation(user.id);

    if (conversation.length === 0) {
        messages.innerHTML = `
            <div class="empty-chat">
                <div class="empty-chat-icon">💬</div>
                <h3>No messages yet</h3>
                <p>
                    Start the conversation with
                    ${escapeHtml(user.firstName)}.
                </p>
            </div>
        `;

        return;
    }

    conversation.forEach(message => {
        const messageElement =
            document.createElement("div");

        messageElement.className =
            `message ${
                message.sender === "me"
                    ? "sent"
                    : "received"
            }`;

        messageElement.innerHTML = `
            <div>
                ${escapeHtml(message.text)}
            </div>

            <span class="message-time">
                ${escapeHtml(message.time)}
            </span>
        `;

        messages.appendChild(
            messageElement
        );
    });

    messages.scrollTop =
        messages.scrollHeight;
}


// =========================
// SEND MESSAGE
// =========================

function sendMessage() {
    const text =
        messageInput.value.trim();

    if (!text) {
        return;
    }

    const user =
        getUser(state.activeConversationUserId);

    if (!user) {
        return;
    }

    const now =
        new Date();

    const time =
        now.toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit"
        });

    const conversation =
        getConversation(user.id);

    conversation.push({
        sender: "me",
        text: text,
        time: time
    });

    messageInput.value = "";

    saveState();

    renderUsers();
    renderChat();

    messageInput.focus();
}


// =========================
// ADMIN PANEL
// =========================

function openAdminPanel() {
    const currentUser =
        getCurrentUser();

    if (
        !currentUser ||
        currentUser.role !== "admin"
    ) {
        return;
    }

    renderAdminUsers();

    adminModal.classList.add("visible");
}


function closeAdminPanel() {
    adminModal.classList.remove(
        "visible"
    );
}


function renderAdminUsers() {
    adminUserList.innerHTML = "";

    state.users.forEach(user => {
        const row =
            document.createElement("div");

        row.className = "admin-user-row";

        row.innerHTML = `
            <div class="admin-user-info">
                <div class="avatar small">
                    ${escapeHtml(getInitials(user))}
                </div>

                <div>
                    <strong>
                        ${escapeHtml(
                            getUserFullName(user)
                        )}
                    </strong>

                    <span>
                        @${escapeHtml(user.username)}
                        ·
                        ${escapeHtml(user.role)}
                    </span>
                </div>
            </div>

            <div class="admin-user-actions">
                <button
                    class="secondary-button"
                    data-action="edit"
                    data-id="${user.id}"
                >
                    Edit
                </button>

                ${
                    user.id !== "admin-1"
                        ? `
                            <button
                                class="danger-button"
                                data-action="delete"
                                data-id="${user.id}"
                            >
                                Delete
                            </button>
                        `
                        : ""
                }
            </div>
        `;

        adminUserList.appendChild(row);
    });
}


// =========================
// CREATE USER
// =========================

function createUser(event) {
    event.preventDefault();

    const firstName =
        document
            .getElementById("firstName")
            .value
            .trim();

    const lastName =
        document
            .getElementById("lastName")
            .value
            .trim();

    const username =
        document
            .getElementById("username")
            .value
            .trim()
            .toLowerCase();

    const role =
        document
            .getElementById("role")
            .value;

    if (
        !firstName ||
        !lastName ||
        !username
    ) {
        return;
    }

    const usernameExists =
        state.users.some(
            user =>
                user.username.toLowerCase() ===
                username
        );

    if (usernameExists) {
        alert(
            "That username already exists."
        );

        return;
    }

    const newUser = {
        id:
            typeof crypto !== "undefined" &&
            crypto.randomUUID
                ? crypto.randomUUID()
                : `user-${Date.now()}`,

        firstName,
        lastName,
        username,
        role,
        status: "online"
    };

    state.users.push(newUser);

    state.conversations[newUser.id] = [];

    saveState();

    createUserForm.reset();

    renderUsers();
    renderAdminUsers();
}


// =========================
// EDIT USER
// =========================

function editUser(userId) {
    const user =
        getUser(userId);

    if (!user) {
        return;
    }

    const newFirstName =
        prompt(
            "First name:",
            user.firstName
        );

    if (
        newFirstName === null ||
        !newFirstName.trim()
    ) {
        return;
    }

    const newLastName =
        prompt(
            "Last name:",
            user.lastName
        );

    if (
        newLastName === null ||
        !newLastName.trim()
    ) {
        return;
    }

    user.firstName =
        newFirstName.trim();

    user.lastName =
        newLastName.trim();

    saveState();

    renderCurrentUser();
    renderUsers();
    renderAdminUsers();
    renderChat();
}


// =========================
// DELETE USER
// =========================

function deleteUser(userId) {
    const user =
        getUser(userId);

    if (!user) {
        return;
    }

    if (user.id === "admin-1") {
        alert(
            "The primary admin account cannot be deleted."
        );

        return;
    }

    const confirmed =
        confirm(
            `Delete ${getUserFullName(user)}?`
        );

    if (!confirmed) {
        return;
    }

    state.users =
        state.users.filter(
            existingUser =>
                existingUser.id !== userId
        );

    delete state.conversations[userId];

    if (
        state.activeConversationUserId ===
        userId
    ) {
        state.activeConversationUserId =
            null;
    }

    saveState();

    renderUsers();
    renderAdminUsers();
    renderChat();
}


// =========================
// EVENT LISTENERS
// =========================

sendButton.addEventListener(
    "click",
    sendMessage
);


messageInput.addEventListener(
    "keydown",
    event => {
        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {
            event.preventDefault();

            sendMessage();
        }
    }
);


adminButton.addEventListener(
    "click",
    openAdminPanel
);


closeAdminButton.addEventListener(
    "click",
    closeAdminPanel
);


adminModal.addEventListener(
    "click",
    event => {
        if (
            event.target === adminModal
        ) {
            closeAdminPanel();
        }
    }
);


createUserForm.addEventListener(
    "submit",
    createUser
);


adminUserList.addEventListener(
    "click",
    event => {
        const button =
            event.target.closest("button");

        if (!button) {
            return;
        }

        const userId =
            button.dataset.id;

        const action =
            button.dataset.action;

        if (action === "edit") {
            editUser(userId);
        }

        if (action === "delete") {
            deleteUser(userId);
        }
    }
);


// =========================
// INITIALIZE
// =========================

function initialize() {
    const currentUser =
        getCurrentUser();

    if (!currentUser) {
        state.currentUserId =
            "admin-1";
    }

    if (
        !state.activeConversationUserId
    ) {
        state.activeConversationUserId =
            null;
    }

    saveState();

    renderCurrentUser();
    renderUsers();
    renderChat();
}


initialize();