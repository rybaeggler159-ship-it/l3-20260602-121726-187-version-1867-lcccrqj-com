(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initPlayer(box) {
    var video = box.querySelector("video");
    var source = video && video.querySelector("source");
    var button = box.querySelector(".play-mask");
    if (!video || !source) {
      return;
    }
    var src = source.getAttribute("src");
    var loaded = false;

    function attach() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
    }

    function play() {
      attach();
      var result = video.play();
      if (result && result.catch) {
        result.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener("play", function () {
      box.classList.add("is-playing");
    });

    video.addEventListener("pause", function () {
      if (!video.ended) {
        box.classList.remove("is-playing");
      }
    });
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll(".static-player")).forEach(initPlayer);
  });
})();
