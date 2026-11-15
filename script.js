let audio = document.getElementById("soundscape");
let photo = document.getElementById("scene-image");
let chapters = document.getElementsByClassName("chapter");

let scenes = [
  { start: 0, video: document.getElementById("walking-video") },
  { start: 32, video: document.getElementById("boat-video") },
  { start: 43, video: document.getElementById("fishing-video") },
  { start: 56, video: null }
];

let currentScene = 0;
let video = scenes[0].video;

function pauseVideo() {
  if (video) video.pause();
}

function changeScene(nextScene) {
  if (video) {
    video.pause();
    video.hidden = true;
  }

  chapters[currentScene].removeAttribute("aria-current");
  chapters[nextScene].setAttribute("aria-current", "true");
  currentScene = nextScene;
  video = scenes[currentScene].video;

  if (video) video.hidden = false;
  photo.hidden = video !== null;
}

function updateScene(event) {
  let time = audio.currentTime;
  let nextScene = 0;

  for (let i = 0; i < scenes.length; i++) {
    if (time >= scenes[i].start) nextScene = i;
  }

  let isNewScene = nextScene !== currentScene;
  if (isNewScene) changeScene(nextScene);
  if (!video || audio.seeking) return;

  if (isNewScene || event.type === "seeked" || event.type === "playing") {
    let offset = time - scenes[currentScene].start;
    if (isNewScene && event.type === "timeupdate") offset = 0;
    if (video.loop && video.duration > 0) offset = offset % video.duration;
    video.currentTime = offset;
  }

  if (!audio.paused && video.paused && !video.ended) {
    let activeVideo = video;
    activeVideo.play().catch(function (error) {
      if (error.name !== "AbortError") activeVideo.pause();
    });
  }
}

for (let i = 0; i < chapters.length; i++) {
  chapters[i].addEventListener("click", function () {
    audio.currentTime = scenes[i].start;
  });
}

audio.addEventListener("playing", updateScene);
audio.addEventListener("timeupdate", updateScene);
audio.addEventListener("seeking", pauseVideo);
audio.addEventListener("seeked", updateScene);
audio.addEventListener("pause", pauseVideo);
audio.addEventListener("waiting", pauseVideo);
