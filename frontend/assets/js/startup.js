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
      redirect: "manual"  // This is critical to handle 303 manually
    });

    if (res.status === 303) {
      const location = res.headers.get("Location");
      if (location) {
        // Follow the redirect manually
        window.location.href = location;
      } else {
        // Fallback in case the Location header isn't read
        window.location.href = "/index.html";
      }
    } else {
      alert("Submission failed. Please try again.");
    }
  } catch (err) {
    console.error("Error submitting form:", err);
    alert("Connection error.");
  }
});
