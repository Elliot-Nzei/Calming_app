document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const selectedTask = params.get("task");

  const activityMap = {
    meditation: {
      title: "🧘‍♀️ Meditation Zen",
      time: "10:00 a.m.",
      status: "In Progress",
      bg: "../images/meditation.jpg"
    },
    breathing: {
      title: "🌬️ Breathing Session",
      time: "1:00 p.m.",
      status: "To Do",
      bg: "frontend/assets/images/mental/bedtime.jpeg"
    },
    journaling: {
      title: "🗘️ Journaling",
      time: "6:00 p.m.",
      status: "To Do",
      bg: "../images/journaling.jpg"
    },
    bedtime: {
      title: "🌙 Bedtime Routine",
      time: "11:00 p.m.",
      status: "To Do",
      bg: "../images/bedtime.jpg"
    }
  };

  const container = document.getElementById("activity-schedule");
  const taskTitle = document.getElementById("task-title");

  if (activityMap[selectedTask]) {
    const activity = activityMap[selectedTask];

    // Set background
    document.body.style.backgroundImage = `url('${activity.bg}')`;

    // Set activity content
    container.innerHTML = `
      <div class="activity-entry">
        <h3>${activity.title}</h3>
        <p>Time: ${activity.time}</p>
        <p>Status: ${activity.status}</p>
      </div>
    `;

    // Set the task title for the heading
    taskTitle.textContent = activity.title;
  } else {
    container.innerHTML = `<p>No activity selected. Go back and choose one.</p>`;
    document.body.style.backgroundImage = `url('../images/default-bg.jpg')`;
  }
});