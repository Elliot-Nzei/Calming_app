const chatBox = document.getElementById("chat-box");
const chatForm = document.getElementById("chat-form");
const messageInput = document.getElementById("message-input");

// Generate or retrieve client ID (persistent per user)
function getClientId() {
  let clientId = localStorage.getItem("clientId");
  if (!clientId) {
    clientId = 'client-' + Math.random().toString(36).substring(2, 10);
    localStorage.setItem("clientId", clientId);
  }
  return clientId;
}

const clientId = getClientId(); // ✅ Must be defined before usage
console.log("ClientID:", clientId);

// === Load messages from backend ===
async function loadMessages() {
  if (!chatBox) return;
  try {
    const res = await fetch("/api/messages");
    if (!res.ok) throw new Error("Failed to load messages");
    const data = await res.json();

    chatBox.innerHTML = "";

    const frag = document.createDocumentFragment();
    data.messages.forEach(msg => {
      const div = document.createElement("div");
      div.classList.add("chat-message");
      div.classList.add(msg.sender === clientId ? "sent" : "received");
      div.textContent = msg.text;
      frag.appendChild(div);
    });

    chatBox.appendChild(frag);
    chatBox.scrollTop = chatBox.scrollHeight;

    console.log("Messages loaded:", data.messages);
  } catch (err) {
    console.error("Load Error:", err);
    appendError("⚠️ Unable to load messages.");
  }
}

// === Send a new message ===
chatForm?.addEventListener("submit", async e => {
  e.preventDefault();
  const message = messageInput?.value.trim();
  if (!message) return;

  try {
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, sender: clientId }),
    });

    if (!res.ok) throw new Error("Failed to send");

    messageInput.value = "";
    await loadMessages();
  } catch (err) {
    console.error("Send Error:", err);
    appendError("⚠️ Unable to send message.");
  }
});

// === Send on Enter (without Shift) ===
messageInput?.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    chatForm?.requestSubmit();
  }
});

// === Error Logging Helpers ===
function appendError(msg) {
  if (!chatBox) return;
  const p = document.createElement("p");
  p.textContent = msg;
  p.style.color = "tomato";
  p.style.fontStyle = "italic";
  p.style.margin = "10px 0";
  chatBox.appendChild(p);
  chatBox.scrollTop = chatBox.scrollHeight;
}

window.addEventListener("error", event => {
  console.error("JS Error:", event.message);
  appendError(`⚠️ JS Error: ${event.message}`);
});

window.addEventListener("unhandledrejection", event => {
  console.error("Unhandled Promise:", event.reason);
  appendError(`⚠️ Unhandled Promise: ${event.reason}`);
});

window.addEventListener("offline", () => {
  console.warn("Offline");
  appendError("⚠️ You are offline. Messages will not send.");
});

// === Init ===
loadMessages();
setInterval(loadMessages, 3000); // auto-refresh every 3s
