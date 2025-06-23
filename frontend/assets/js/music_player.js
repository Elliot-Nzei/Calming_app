const audio = document.getElementById("audio");
const trackTitle = document.getElementById("track-title");
const playBtn = document.getElementById("play-btn");
const progress = document.getElementById("progress");
const currentTimeDisplay = document.getElementById("current-time");
const durationDisplay = document.getElementById("duration");
const trackList = document.getElementById("track-list");

let isPlaying = false;
let currentTrackIndex = 0;
let tracks = [];

// Load a track by filename and update UI
function loadTrack(fileName, index = 0) {
  audio.src = `assets/music/${fileName}`;
  trackTitle.textContent = fileName.replace(".mp3", "").replace(/_/g, " ");
  audio.load();

  // Reset UI and state
  isPlaying = false;
  playBtn.innerHTML = '<i class="fas fa-play"></i>';
  progress.value = 0;
  currentTimeDisplay.textContent = "0:00";
  durationDisplay.textContent = "0:00";
  currentTrackIndex = index;

  updateActiveTrackUI();
}

// Update visual highlight of the current track in the list
function updateActiveTrackUI() {
  const options = trackList.querySelectorAll(".track-option");
  options.forEach((el, idx) => {
    el.classList.toggle("active", idx === currentTrackIndex);
  });
}

// Play or pause toggle
function togglePlay() {
  if (!audio.src) return; // No track loaded, do nothing

  if (isPlaying) {
    audio.pause();
    playBtn.innerHTML = '<i class="fas fa-play"></i>';
  } else {
    audio.play().catch(err => {
      console.warn("Playback prevented:", err);
    });
    playBtn.innerHTML = '<i class="fas fa-pause"></i>';
  }
  isPlaying = !isPlaying;
}

// Update progress bar and time displays
audio.addEventListener("timeupdate", () => {
  if (!audio.duration) return;

  progress.value = (audio.currentTime / audio.duration) * 100 || 0;
  currentTimeDisplay.textContent = formatTime(audio.currentTime);
  durationDisplay.textContent = formatTime(audio.duration);
});

// User changes progress input -> update audio current time
progress.addEventListener("input", () => {
  if (!audio.duration) return;
  audio.currentTime = (progress.value / 100) * audio.duration;
});

// When track ends, optionally auto-move to next track and play
audio.addEventListener("ended", () => {
  if (currentTrackIndex + 1 < tracks.length) {
    loadTrack(tracks[currentTrackIndex + 1], currentTrackIndex + 1);
    togglePlay();
  } else {
    // End of playlist
    isPlaying = false;
    playBtn.innerHTML = '<i class="fas fa-play"></i>';
    progress.value = 0;
  }
});

function formatTime(time) {
  if (isNaN(time)) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

playBtn.addEventListener("click", togglePlay);

// Fetch track list from backend and populate UI
fetch("http://localhost:8000/api/music-tracks")
  .then(res => res.json())
  .then(data => {
    tracks = data.tracks || [];
    trackList.innerHTML = "";
    tracks.forEach((track, idx) => {
      const li = document.createElement("li");
      li.textContent = track.replace(".mp3", "").replace(/_/g, " ");
      li.classList.add("track-option");
      li.setAttribute("tabindex", "0");
      li.setAttribute("role", "button");
      li.addEventListener("click", () => loadTrack(track, idx));
      li.addEventListener("keypress", e => {
        if (e.key === "Enter" || e.key === " ") {
          loadTrack(track, idx);
        }
      });
      trackList.appendChild(li);
    });
    if (tracks.length > 0) {
      loadTrack(tracks[0], 0);
    }
  })
  .catch(err => {
    console.error("Failed to load track list:", err);
    trackTitle.textContent = "Failed to load tracks.";
  });
