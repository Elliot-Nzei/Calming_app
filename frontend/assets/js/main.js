document.addEventListener("DOMContentLoaded", () => {
  // Navbar injection (already solid)
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

  // Date display
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

  // Carousel logic
  const leftArrow = document.querySelector('.carousel-arrow.left');
  const rightArrow = document.querySelector('.carousel-arrow.right');
  const slider = document.querySelector('.todo-slider');

  if (leftArrow && rightArrow && slider) {
    leftArrow.addEventListener('click', () => {
      slider.scrollBy({ left: -slider.clientWidth, behavior: 'smooth' });
    });

    rightArrow.addEventListener('click', () => {
      slider.scrollBy({ left: slider.clientWidth, behavior: 'smooth' });
    });
  }
});


document.addEventListener("DOMContentLoaded", () => {
  const leftArrow = document.querySelector('.carousel-arrow.left');
  const rightArrow = document.querySelector('.carousel-arrow.right');
  const slider = document.querySelector('.todo-slider');

  const scrollAmount = slider.offsetWidth * 0.7; // scroll about 70% width per click

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

  slider.addEventListener('scroll', () => {
    updateArrows();
  });

  // Initialize arrow states
  updateArrows();

  // Keyboard navigation when focused on slider
  slider.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      leftArrow.click();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      rightArrow.click();
    }
  });
});


document.addEventListener("DOMContentLoaded", () => {
  const slider = document.querySelector('.todo-slider');
  if (!slider) return;

  let isDragging = false;
  let startX = 0;
  let scrollLeft = 0;
  let velocity = 0;
  let animationFrameId = null;

  const scrollSpeed = 0.5; // Base auto-scroll speed (px per frame)
  const friction = 0.95;   // Friction factor for inertia
  const minVelocity = 0.05; // Minimum velocity threshold to stop inertia

  // Clone slides for seamless infinite loop
  const slides = Array.from(slider.children);
  const totalSlides = slides.length;
  slides.forEach(slide => {
    const clone = slide.cloneNode(true);
    slider.appendChild(clone);
  });

  const maxScrollLeft = slider.scrollWidth / 2;

  // Animation loop
  function autoScroll() {
    if (!isDragging) {
      // Continuous auto-scroll plus inertia from drag release
      velocity = velocity * friction + scrollSpeed * (1 - friction);
      slider.scrollLeft += velocity;

      // Loop back seamlessly
      if (slider.scrollLeft >= maxScrollLeft) {
        slider.scrollLeft -= maxScrollLeft;
      }
    }

    animationFrameId = requestAnimationFrame(autoScroll);
  }

  // Start the animation loop
  animationFrameId = requestAnimationFrame(autoScroll);

  // Drag start
  function onDragStart(e) {
    isDragging = true;
    startX = e.pageX || e.touches[0].pageX;
    scrollLeft = slider.scrollLeft;
    velocity = 0;
  }

  // Drag move
  function onDragMove(e) {
    if (!isDragging) return;
    e.preventDefault();

    const x = e.pageX || e.touches[0].pageX;
    const walk = startX - x;
    slider.scrollLeft = scrollLeft + walk;

    // Calculate velocity
    const now = performance.now();
    velocity = (slider.scrollLeft - scrollLeft) / (now - (slider._lastTime || now));
    slider._lastTime = now;
    scrollLeft = slider.scrollLeft;
    startX = x;
  }

  // Drag end
  function onDragEnd() {
    isDragging = false;
    slider._lastTime = null;
  }

  // Event listeners
  slider.addEventListener('mousedown', onDragStart);
  slider.addEventListener('mousemove', onDragMove);
  slider.addEventListener('mouseleave', onDragEnd);
  slider.addEventListener('mouseup', onDragEnd);

  slider.addEventListener('touchstart', onDragStart);
  slider.addEventListener('touchmove', onDragMove);
  slider.addEventListener('touchend', onDragEnd);
  slider.addEventListener('touchcancel', onDragEnd);

  // Optional: pause auto-scroll on hover/focus
  slider.addEventListener('mouseenter', () => { isDragging = true; });
  slider.addEventListener('mouseleave', () => { isDragging = false; });
});
