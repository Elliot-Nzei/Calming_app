document.addEventListener('DOMContentLoaded', () => {
  const dateEl = document.getElementById("today-date");
  const taskList = document.getElementById("task-list");
  const now = new Date();
  const todayDateStr = now.toDateString();
  dateEl.textContent = todayDateStr;

  const LAST_ACTIVE_KEY = "lastActiveDate";
  const TASKS_KEY = "scheduledTasks";

  // === AUTO RESET TASKS AT MIDNIGHT ===
  const lastActiveDate = localStorage.getItem(LAST_ACTIVE_KEY);
  if (lastActiveDate !== todayDateStr) {
    localStorage.removeItem(TASKS_KEY);
    localStorage.setItem(LAST_ACTIVE_KEY, todayDateStr);
  }

  // === TASK OPTIONS ===
  const activityMap = {
    meditation: {
      title: "Meditation Zen",
      time: "10:00 AM",
    },
    breathing: {
      title: "Breathing Session",
      time: "01:00 PM",
    },
    journaling: {
      title: "Journaling",
      time: "06:00 PM",
    },
    bedtime: {
      title: "Bedtime Routine",
      time: "11:00 PM",
    }
  };

  // === READ URL PARAM ===
  const urlParams = new URLSearchParams(window.location.search);
  const taskParam = urlParams.get("task");

  if (taskParam && activityMap[taskParam]) {
    const stored = JSON.parse(localStorage.getItem(TASKS_KEY) || '[]');
    const isAlreadyAdded = stored.some(t => t.title === activityMap[taskParam].title);

    if (!isAlreadyAdded) {
      const newEntry = {
        title: activityMap[taskParam].title,
        time: activityMap[taskParam].time,
        created: now.toISOString()
      };
      stored.push(newEntry);
      localStorage.setItem(TASKS_KEY, JSON.stringify(stored));
    }
  }

  // === SHOW TASKS ===
  const stored = JSON.parse(localStorage.getItem(TASKS_KEY) || '[]');
  if (stored.length === 0) {
    taskList.innerHTML = '<li>No activity scheduled. Go back and choose one.</li>';
  } else {
    taskList.innerHTML = stored.map(task => `
      <li class="activity-entry">
        <h3>${task.title}</h3>
        <p>Time: ${task.time}</p>
        <p>Added: ${new Date(task.created).toLocaleString()}</p>
      </li>
    `).join('');
  }
});
