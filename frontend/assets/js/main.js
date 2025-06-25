document.addEventListener("DOMContentLoaded", () => {
  // === Navbar Injection ===
  const navbarContainer = document.getElementById("navbar");
  if (navbarContainer) {
    fetch("/components/navbar.html")
      .then(res => {
        if (!res.ok) throw new Error("Navbar failed to load");
        return res.text();
      })
      .then(data => navbarContainer.innerHTML = data)
      .catch(err => console.error("Error loading navbar:", err));
  }

  // === Date Display ===
  const dateSpan = document.getElementById("current-date");
  if (dateSpan) {
    const now = new Date();
    dateSpan.textContent = now.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // === User Greeting ===
  const greetingEl = document.getElementById("personal-greeting");
  if (greetingEl) {
    fetch("/api/user-info")
      .then(res => {
        if (!res.ok) throw new Error("No user info found");
        return res.json();
      })
      .then(data => {
        const name = data.name || "Guest";
        greetingEl.textContent = `Welcome, ${name}`;
      })
      .catch(() => {
        console.warn("User not logged in or not found.");
      });
  }

  // === Carousel Logic ===
  const leftArrow = document.querySelector('.carousel-arrow.left');
  const rightArrow = document.querySelector('.carousel-arrow.right');
  const slider = document.querySelector('.todo-slider');

  if (leftArrow && rightArrow && slider) {
    const scrollAmount = slider.offsetWidth * 0.7;

    function updateArrows() {
      leftArrow.setAttribute('aria-disabled', slider.scrollLeft <= 0);
      rightArrow.setAttribute(
        'aria-disabled',
        slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 1
      );
    }

    leftArrow.addEventListener('click', () => {
      slider.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });

    rightArrow.addEventListener('click', () => {
      slider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });

    slider.addEventListener('scroll', updateArrows);
    slider.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        leftArrow.click();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        rightArrow.click();
      }
    });

    updateArrows(); // Init
  }

  // === Infinite Auto-Scrolling Slider with Drag ===
  if (slider) {
    let isDragging = false;
    let startX = 0;
    let scrollLeft = 0;
    let velocity = 0;
    const scrollSpeed = 0.5;
    const friction = 0.95;
    const maxScrollLeft = slider.scrollWidth / 2;

    const slides = Array.from(slider.children);
    slides.forEach(slide => {
      const clone = slide.cloneNode(true);
      slider.appendChild(clone);
    });

    function autoScroll() {
      if (!isDragging) {
        velocity = velocity * friction + scrollSpeed * (1 - friction);
        slider.scrollLeft += velocity;
        if (slider.scrollLeft >= maxScrollLeft) {
          slider.scrollLeft -= maxScrollLeft;
        }
      }
      requestAnimationFrame(autoScroll);
    }

    autoScroll();

    function onDragStart(e) {
      isDragging = true;
      startX = e.pageX || e.touches[0].pageX;
      scrollLeft = slider.scrollLeft;
      velocity = 0;
    }

    function onDragMove(e) {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX || e.touches[0].pageX;
      const walk = startX - x;
      slider.scrollLeft = scrollLeft + walk;
      const now = performance.now();
      velocity = (slider.scrollLeft - scrollLeft) / (now - (slider._lastTime || now));
      slider._lastTime = now;
      scrollLeft = slider.scrollLeft;
      startX = x;
    }

    function onDragEnd() {
      isDragging = false;
      slider._lastTime = null;
    }

    slider.addEventListener('mousedown', onDragStart);
    slider.addEventListener('mousemove', onDragMove);
    slider.addEventListener('mouseleave', onDragEnd);
    slider.addEventListener('mouseup', onDragEnd);
    slider.addEventListener('touchstart', onDragStart);
    slider.addEventListener('touchmove', onDragMove);
    slider.addEventListener('touchend', onDragEnd);
    slider.addEventListener('touchcancel', onDragEnd);
    slider.addEventListener('mouseenter', () => isDragging = true);
    slider.addEventListener('mouseleave', () => isDragging = false);
  }

  // === Todo Card Navigation ===
  document.querySelectorAll('.todo-card').forEach(card => {
    card.addEventListener('click', () => {
      const task = card.dataset.task;
      localStorage.setItem('selectedTask', task);
      window.location.href = './mental.html';
    });
  });
});
