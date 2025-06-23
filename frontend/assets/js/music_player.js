const audio = document.getElementById("audio");
const trackTitle = document.getElementById("track-title");
const playBtn = document.getElementById("play-btn");
const progress = document.getElementById("progress");
const currentTimeDisplay = document.getElementById("current-time");
const durationDisplay = document.getElementById("duration");
const trackList = document.getElementById("track-list");

let isPlaying = false;

function loadTrack(fileName) {
  audio.src = `assets/music/${fileName}`;
  trackTitle.textContent = fileName.replace(".mp3", "").replace(/_/g, " ");
  audio.load();
  audio.play();
  isPlaying = true;
  playBtn.innerHTML = '<i class="fas fa-pause"></i>';
}

function togglePlay() {
  if (isPlaying) {
    audio.pause();
    playBtn.innerHTML = '<i class="fas fa-play"></i>';
  } else {
    audio.play();
    playBtn.innerHTML = '<i class="fas fa-pause"></i>';
  }
  isPlaying = !isPlaying;
}

playBtn.addEventListener("click", togglePlay);

audio.addEventListener("timeupdate", () => {
  progress.value = (audio.currentTime / audio.duration) * 100 || 0;
  currentTimeDisplay.textContent = formatTime(audio.currentTime);
  durationDisplay.textContent = formatTime(audio.duration);
});

progress.addEventListener("input", () => {
  audio.currentTime = (progress.value / 100) * audio.duration;
});

function formatTime(time) {
  if (isNaN(time)) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

// Load track list from backend
fetch("http://localhost:8000/api/music-tracks")
  .then(res => res.json())
  .then(data => {
    data.tracks.forEach(track => {
      const li = document.createElement("li");
      li.textContent = track.replace(".mp3", "").replace(/_/g, " ");
      li.classList.add("track-option");
      li.onclick = () => loadTrack(track);
      trackList.appendChild(li);
    });
    if (data.tracks.length > 0) {
      loadTrack(data.tracks[0]);
    }
  })
  .catch(err => {
    console.error("Failed to load track list:", err);
  });
