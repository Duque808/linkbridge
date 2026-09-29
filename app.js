const conversations = [
  {
    id: 1,
    name: "John Smith",
    status: "Online",
    messages: [
      {
        sender: "them",
        text: "Hey Andre, are you around?",
        time: "12:20 PM"
      },
      {
        sender: "me",
        text: "Yes, how can I help?",
        time: "12:21 PM"
      },
      {
        sender: "them",
        text: "I need help with a client call.",
        time: "12:22 PM"
      }
    ]
  },

  {
    id: 2,
    name: "Sarah Johnson",
    status: "Offline",
    messages: [
      {
        sender: "them",
        text: "Can you review the ticket when you have a moment?",
        time: "11:45 AM"
      }
    ]
  },

  {
    id: 3,
    name: "IT Support",
    status: "Online",
    messages: [
      {
        sender: "them",
        text: "Welcome to the IT Support channel.",
        time: "10:15 AM"
      }
    ]
  }
];


let activeConversationId = 1;


const conversationList =
  document.getElementById("conversationList");

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


function getActiveConversation() {

  return conversations.find(
    conversation =>
      conversation.id === activeConversationId
  );

}


function renderConversations() {

  conversationList.innerHTML = "";

  conversations.forEach(conversation => {

    const element = document.createElement("div");

    element.className = "conversation";

    if (conversation.id === activeConversationId) {
      element.classList.add("active");
    }

    const initial =
      conversation.name.charAt(0).toUpperCase();

    const lastMessage =
      conversation.messages.length > 0
        ? conversation.messages[
            conversation.messages.length - 1
          ].text
        : "No messages yet";

    element.innerHTML = `
      <div class="avatar">
        ${initial}
      </div>

      <div class="conversation-info">

        <span class="conversation-name">
          ${conversation.name}
        </span>

        <span class="conversation-preview">
          ${lastMessage}
        </span>

      </div>
    `;

    element.addEventListener("click", () => {

      activeConversationId = conversation.id;

      renderConversations();
      renderChat();

    });

    conversationList.appendChild(element);

  });

}


function renderChat() {

  const conversation = getActiveConversation();

  if (!conversation) {
    return;
  }

  chatName.textContent = conversation.name;

  chatStatus.textContent = conversation.status;

  messages.innerHTML = "";

  conversation.messages.forEach(message => {

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
        ${message.time}
      </span>
    `;

    messages.appendChild(messageElement);

  });

  messages.scrollTop = messages.scrollHeight;

}


function sendMessage() {

  const text =
    messageInput.value.trim();

  if (!text) {
    return;
  }

  const conversation =
    getActiveConversation();

  if (!conversation) {
    return;
  }

  const now =
    new Date();

  const time =
    now.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit"
    });

  conversation.messages.push({
    sender: "me",
    text: text,
    time: time
  });

  messageInput.value = "";

  renderConversations();
  renderChat();

}


function escapeHtml(text) {

  const div =
    document.createElement("div");

  div.textContent = text;

  return div.innerHTML;

}


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


renderConversations();

renderChat();