document.getElementById("user-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();

  if (!name || !email) {
    alert("Please fill out all fields.");
    return;
  }

  try {
    const res = await fetch("/submit-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ name, email }),
    });

    if (res.ok) {
      window.location.href = "/pages/index.html";
    } else {
      alert("Something went wrong. Try again.");
    }
  } catch (err) {
    console.error("Error submitting form:", err);
    alert("Failed to connect to server.");
  }
});
