document.addEventListener('DOMContentLoaded', () => {
  const dateEl = document.getElementById("today-date");
  const taskList = document.getElementById("task-list");
  const taskForm = document.getElementById("task-form");
  const taskNameInput = document.getElementById("task-name");
  const taskTimeInput = document.getElementById("task-time");

  const now = new Date();
  const todayDateStr = now.toDateString();

  const LAST_ACTIVE_KEY = "lastActiveDate";
  const TASKS_KEY = "scheduledTasks";

  // Daily reset of tasks
  const lastActiveDate = localStorage.getItem(LAST_ACTIVE_KEY);
  if (lastActiveDate !== todayDateStr) {
    localStorage.removeItem(TASKS_KEY);
    localStorage.setItem(LAST_ACTIVE_KEY, todayDateStr);
  }

  // Load stored tasks
  let stored = JSON.parse(localStorage.getItem(TASKS_KEY) || '[]');

  // Format "HH:MM"
  function formatTime(date) {
    return date.toTimeString().slice(0, 5);
  }

  // === ENHANCEMENT: Auto-import task from selectedTask ===
  const selectedTaskSlug = localStorage.getItem("selectedTask");
  if (selectedTaskSlug) {
    const titleMap = {
      meditation: "Meditation Zen",
      breathing: "Breathing Session",
      journaling: "Journaling",
      bedtime: "Bedtime Routine"
    };

    const defaultTimes = {
      meditation: "08:00",
      breathing: "14:00",
      journaling: "18:00",
      bedtime: "21:00"
    };

    const title = titleMap[selectedTaskSlug] || selectedTaskSlug;
    const alreadyExists = stored.some(task => task.title === title);

    if (!alreadyExists) {
      const created = new Date();
      const defaultTime = defaultTimes[selectedTaskSlug];
      const time = defaultTime || formatTime(new Date(created.getTime() + 5 * 60000)); // +5 min

      const autoTask = {
        title,
        time,
        created: created.toISOString()
      };

      stored.push(autoTask);
      localStorage.setItem(TASKS_KEY, JSON.stringify(stored));
    }

    localStorage.removeItem("selectedTask");
  }

  // === RENDER TASK LIST ===
  function renderTaskList() {
    stored = JSON.parse(localStorage.getItem(TASKS_KEY) || '[]');
    if (stored.length === 0) {
      taskList.innerHTML = '<li>No activity scheduled. Go back and choose one.</li>';
    } else {
      taskList.innerHTML = stored.map((task, index) => `
        <li class="activity-entry" data-index="${index}">
          <h3>${task.title}</h3>
          <p>Time: ${task.time}</p>
          <p>Added: ${new Date(task.created).toLocaleString()}</p>
          <button class="delete-task-btn" aria-label="Delete task ${task.title}" title="Delete task">
            <i class="fas fa-trash"></i>
          </button>
        </li>
      `).join('');
    }

    taskList.querySelectorAll('.delete-task-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const li = e.target.closest('li.activity-entry');
        if (!li) return;
        const idx = Number(li.dataset.index);
        if (isNaN(idx)) return;

        stored.splice(idx, 1);
        localStorage.setItem(TASKS_KEY, JSON.stringify(stored));
        renderTaskList();
      });
    });
  }

  // === NOTIFICATION ===
  function triggerNotification(taskName) {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(`⏰ Reminder: ${taskName}`);
    }

    const beep = new Audio("https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg");
    beep.play().catch(() => {});

    if (navigator.vibrate) {
      navigator.vibrate([300, 200, 300]);
    }
  }

  const triggeredToday = new Set();

  function checkTasks() {
    const currentTime = formatTime(new Date());
    const dateKey = new Date().toISOString().slice(0, 10);

    stored.forEach(task => {
      const key = `${dateKey}-${task.title}-${task.time}`;
      if (task.time.slice(0, 5) === currentTime && !triggeredToday.has(key)) {
        triggerNotification(task.title);
        triggeredToday.add(key);
      }
    });
  }

  // === Handle Manual Task Form ===
  if (taskForm) {
    taskForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const title = taskNameInput.value.trim();
      const time = taskTimeInput.value;

      if (!title || !time) return;

      const newTask = {
        title,
        time,
        created: new Date().toISOString()
      };

      stored.push(newTask);
      localStorage.setItem(TASKS_KEY, JSON.stringify(stored));
      renderTaskList();
      taskForm.reset();
      alert(`✅ Task "${title}" scheduled at ${time}`);
    });
  }

  if (dateEl) dateEl.textContent = todayDateStr;

  renderTaskList();
  setInterval(checkTasks, 30000);

  if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission();
  }
});

