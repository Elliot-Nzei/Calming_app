const chatBox = document.getElementById("chat-box");
const chatForm = document.getElementById("chat-form");
const messageInput = document.getElementById("message-input");

// Load messages from backend
async function loadMessages() {
  try {
    const res = await fetch("http://localhost:8000/api/messages");
    if (!res.ok) throw new Error("Failed to load messages");
    const data = await res.json();

    chatBox.innerHTML = "";
    data.messages.forEach(msg => {
      const p = document.createElement("p");
      p.textContent = msg;
      chatBox.appendChild(p);
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
      body: JSON.stringify({ message }),
    });
    if (!res.ok) throw new Error("Failed to send message");

    messageInput.value = "";
    await loadMessages();
  } catch (error) {
    console.error(error);
    appendError("Error sending message. Please try again.");
  }
});

// Poll messages every 3 seconds
loadMessages();
setInterval(loadMessages, 3000);

// Global error handling
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

// Append styled error to chat
function appendError(msg) {
  const errorMsg = document.createElement("p");
  errorMsg.textContent = msg;
  errorMsg.style.color = "tomato";
  errorMsg.style.fontStyle = "italic";
  errorMsg.style.marginTop = "10px";
  chatBox.appendChild(errorMsg);
  chatBox.scrollTop = chatBox.scrollHeight;
}
