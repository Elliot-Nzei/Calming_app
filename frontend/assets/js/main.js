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

  // === Carousel Logic (Manual only) ===
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

  // === Todo Card Navigation (preserve ?task=... and store in localStorage) ===
  document.querySelectorAll('.todo-card').forEach(card => {
    card.addEventListener('click', (e) => {
      const url = new URL(card.href);
      const task = url.searchParams.get('task');
      if (task) {
        localStorage.setItem('selectedTask', task);
      }
    });
  });
});

// === Task Scheduler ===
const scheduledTasks = [
  { task: "Meditation Zen", time: "08:00" },
  { task: "Breathing Session", time: "14:00" },
  { task: "Journaling", time: "18:00" },
  { task: "Bedtime Routine", time: "21:00" },
];

const notificationMessage = document.getElementById("notification-message");
const notificationContainer = document.querySelector(".notification-container");

function formatTime(date) {
  return date.toTimeString().slice(0, 5); // "HH:MM"
}

function checkTaskNotification() {
  const now = new Date();
  const currentTime = formatTime(now);

  scheduledTasks.forEach(task => {
    if (task.time === currentTime && notificationMessage) {
      notificationMessage.textContent = `⏰ It's time for: ${task.task}`;
      notificationContainer.classList.add("active");
      
      // Optional: use browser notification
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(`It's time for: ${task.task}`);
      }

      // Hide after 1 minute unless re-triggered
      setTimeout(() => {
        if (notificationMessage.textContent.includes(task.task)) {
          notificationMessage.textContent = "";
          notificationContainer.classList.remove("active");
        }
      }, 60 * 1000);
    }
  });
}

// === Ask for notification permission on load ===
if ("Notification" in window && Notification.permission !== "granted") {
  Notification.requestPermission();
}

// Check every 30 seconds
setInterval(checkTaskNotification, 30 * 1000);

document.addEventListener("DOMContentLoaded", () => {
  const notificationMessage = document.getElementById("notification-message");
  const notificationContainer = document.querySelector(".notification-container");
  const taskForm = document.getElementById("task-form");
  const taskNameInput = document.getElementById("task-name");
  const taskTimeInput = document.getElementById("task-time");

  let scheduledTasks = JSON.parse(localStorage.getItem("scheduledTasks")) || [];

  // Save tasks to localStorage
  function saveTasks() {
    localStorage.setItem("scheduledTasks", JSON.stringify(scheduledTasks));
  }

  // Format "HH:MM"
  function formatTime(date) {
    return date.toTimeString().slice(0, 5);
  }

  // Add a new task
  taskForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const task = {
      task: taskNameInput.value.trim(),
      time: taskTimeInput.value
    };
    if (task.task && task.time) {
      scheduledTasks.push(task);
      saveTasks();
      taskForm.reset();
      alert(`Task "${task.task}" scheduled at ${task.time}`);
    }
  });

  // Notification logic
  function triggerNotification(taskName) {
    notificationMessage.textContent = `⏰ It's time for: ${taskName}`;
    notificationContainer.classList.add("active");

    // Browser notification
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(`⏰ Reminder: ${taskName}`);
    }

    // Sound alert
    const beep = new Audio("https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg");
    beep.play().catch(() => {});

    // Vibration
    if (navigator.vibrate) {
      navigator.vibrate([300, 200, 300]);
    }

    setTimeout(() => {
      notificationContainer.classList.remove("active");
      notificationMessage.textContent = "";
    }, 60000); // Hide after 1 minute
  }

  // Check every 30 sec for matches
  const triggeredToday = new Set();
  function checkTaskNotification() {
    const now = new Date();
    const currentTime = formatTime(now);
    const dateKey = now.toISOString().slice(0, 10); // YYYY-MM-DD

    scheduledTasks.forEach(task => {
      const key = `${dateKey}-${task.task}-${task.time}`;
      if (task.time === currentTime && !triggeredToday.has(key)) {
        triggerNotification(task.task);
        triggeredToday.add(key);
      }
    });
  }

  // Permission
  if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission();
  }

  // Start checking
  setInterval(checkTaskNotification, 30000);
});

