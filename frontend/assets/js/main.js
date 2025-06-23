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



// todo list functionality
document.addEventListener("DOMContentLoaded", () => {
  const leftArrow = document.querySelector('.carousel-arrow.left');
  const rightArrow = document.querySelector('.carousel-arrow.right');
  const slider = document.querySelector('.todo-slider');

if (leftArrow && rightArrow && slider) {
  leftArrow.addEventListener('click', () => {
    slider.scrollBy({ left: -300, behavior: 'smooth' });
  });

  rightArrow.addEventListener('click', () => {
    slider.scrollBy({ left: 300, behavior: 'smooth' });
  });
}
}); // ✅ closing brace for DOMContentLoaded





