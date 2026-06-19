function bindMoviePlayer(videoId, buttonId, coverId, url) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  var cover = document.getElementById(coverId);
  var hasLoaded = false;

  if (!video || !button || !cover || !url) {
    return;
  }

  var start = function () {
    if (!hasLoaded) {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
      hasLoaded = true;
    }

    cover.classList.add("is-hidden");
    var playTask = video.play();

    if (playTask && typeof playTask.catch === "function") {
      playTask.catch(function () {});
    }
  };

  button.addEventListener("click", start);
  cover.addEventListener("click", start);
  video.addEventListener("click", function () {
    if (video.paused) {
      start();
    }
  });
}
