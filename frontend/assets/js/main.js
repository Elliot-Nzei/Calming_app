document.addEventListener("DOMContentLoaded", () => {
  const navbarContainer = document.getElementById("navbar");

  fetch("/components/navbar.html")
    .then(res => {
      if (!res.ok) throw new Error("Navbar failed to load");
      return res.text();
    })
    .then(data => {
      navbarContainer.innerHTML = data;
    })
    .catch(err => {
      console.error("Error loading navbar:", err);
    });
});


// Display current date in #current-date
document.addEventListener("DOMContentLoaded", () => {
  const dateSpan = document.getElementById("current-date");
  const now = new Date();

  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  dateSpan.textContent = now.toLocaleDateString(undefined, options);
});
