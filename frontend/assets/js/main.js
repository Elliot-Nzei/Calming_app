document.addEventListener("DOMContentLoaded", () => {
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

  // === Carousel Logic (optional for task cards) ===
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

    updateArrows(); // initialize on load
  }

  // === Todo Card Click Navigation (store task in localStorage) ===
  document.querySelectorAll('.todo-card').forEach(card => {
    card.addEventListener('click', () => {
      const url = new URL(card.href);
      const task = url.searchParams.get('task');
      if (task) localStorage.setItem('selectedTask', task);
    });
  });

  // === Notification Logic ===
  const notificationMessage = document.getElementById("notification-message");
  const notificationContainer = document.querySelector(".notification-container");
  const taskForm = document.getElementById("task-form");
  const taskNameInput = document.getElementById("task-name");
  const taskTimeInput = document.getElementById("task-time");

  let scheduledTasks = JSON.parse(localStorage.getItem("scheduledTasks")) || [];

  function saveTasks() {
    localStorage.setItem("scheduledTasks", JSON.stringify(scheduledTasks));
  }

  function formatTime(date) {
    return date.toTimeString().slice(0, 5); // "HH:MM"
  }

  if (taskForm) {
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
  }

  function triggerNotification(taskName) {
    if (!notificationMessage || !notificationContainer) return;

    notificationMessage.textContent = `⏰ It's time for: ${taskName}`;
    notificationContainer.classList.add("active");

    // Browser Notification
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(`⏰ Reminder: ${taskName}`);
    }

    // Audio alert
    const beep = new Audio("https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg");
    beep.play().catch(() => {});

    // Vibration
    if (navigator.vibrate) navigator.vibrate([300, 200, 300]);

    // Auto-hide after 1 min
    setTimeout(() => {
      notificationContainer.classList.remove("active");
      notificationMessage.textContent = "";
    }, 60000);
  }

  const triggeredToday = new Set();
  function checkTaskNotification() {
    const now = new Date();
    const currentTime = formatTime(now);
    const dateKey = now.toISOString().slice(0, 10);

    scheduledTasks.forEach(task => {
      const key = `${dateKey}-${task.task}-${task.time}`;
      if (task.time === currentTime && !triggeredToday.has(key)) {
        triggerNotification(task.task);
        triggeredToday.add(key);
      }
    });
  }

  // Ask for permission once
  if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission();
  }

  setInterval(checkTaskNotification, 30000); // check every 30 seconds
});
