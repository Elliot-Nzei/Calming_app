document.addEventListener("DOMContentLoaded", () => {
  // Navbar loading (if needed)
  const navbarContainer = document.getElementById("navbar");
  if (navbarContainer) {
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
  }

  // Display current date
  const dateSpan = document.getElementById("current-date");
  if (dateSpan) {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateSpan.textContent = now.toLocaleDateString(undefined, options);
  }

  // Todo carousel arrows functionality
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
});
