const chatBox = document.getElementById("chat-box");
const chatForm = document.getElementById("chat-form");
const messageInput = document.getElementById("message-input");

// Generate or retrieve client ID (persistent per user)
function getClientId() {
  let clientId = localStorage.getItem("clientId");
  if (!clientId) {
    clientId = 'client-' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem("clientId", clientId);
  }
  return clientId;
}

const clientId = getClientId();

// Load messages from backend
async function loadMessages() {
  try {
    const res = await fetch("http://localhost:8000/api/messages");
    if (!res.ok) throw new Error("Failed to load messages");
    const data = await res.json();

    chatBox.innerHTML = "";
    data.messages.forEach(msgObj => {
      const div = document.createElement("div");
      div.classList.add("chat-message");
      div.textContent = msgObj.text;

      if (msgObj.sender === clientId) {
        div.classList.add("sent");
      } else {
        div.classList.add("received");
      }
      chatBox.appendChild(div);
    });
    chatBox.scrollTop = chatBox.scrollHeight;
  } catch (error) {
    console.error(error);
    appendError("Error loading messages. Please try again.");
  }
}

// Handle new message submission
chatForm.addEventListener("submit", async e => {
  e.preventDefault();
  const message = messageInput.value.trim();
  if (!message) return;

  try {
    const res = await fetch("http://localhost:8000/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, sender: clientId }),
    });
    if (!res.ok) throw new Error("Failed to send message");

    messageInput.value = "";
    await loadMessages();
  } catch (error) {
    console.error(error);
    appendError("Error sending message. Please try again.");
  }
});

// Send message on Enter key (without Shift)
messageInput.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    chatForm.requestSubmit();
  }
});

loadMessages();
setInterval(loadMessages, 3000);

window.addEventListener("error", event => {
  console.error("JS Error:", event.message);
  appendError(`JS Error: ${event.message}`);
});

window.addEventListener("unhandledrejection", event => {
  console.error("Unhandled Promise Rejection:", event.reason);
  appendError(`Unhandled Promise: ${event.reason}`);
});

window.addEventListener("offline", () => {
  console.warn("You are offline.");
  appendError("⚠️ You are offline. Messages won’t be sent.");
});

function appendError(msg) {
  const errorMsg = document.createElement("p");
  errorMsg.textContent = msg;
  errorMsg.style.color = "tomato";
  errorMsg.style.fontStyle = "italic";
  errorMsg.style.marginTop = "10px";
  chatBox.appendChild(errorMsg);
  chatBox.scrollTop = chatBox.scrollHeight;
}
