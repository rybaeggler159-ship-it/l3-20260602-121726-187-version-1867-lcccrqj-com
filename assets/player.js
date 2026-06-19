(function () {
  function init(box) {
    var video = box.querySelector('video');
    var src = box.getAttribute('data-video');
    var cover = box.querySelector('.player-cover');
    var play = box.querySelector('.play-toggle');
    var mute = box.querySelector('.mute-toggle');
    var full = box.querySelector('.fullscreen-toggle');
    if (!video || !src) {
      box.classList.add('has-error');
      return;
    }

    var ready = false;
    var markReady = function () {
      ready = true;
      box.classList.remove('has-error');
    };

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      markReady();
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        markReady();
      });
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          box.classList.add('has-error');
        }
      });
    } else {
      box.classList.add('has-error');
    }

    var start = function () {
      if (!ready && !video.src && !(window.Hls && window.Hls.isSupported())) {
        box.classList.add('has-error');
        return;
      }
      if (video.paused) {
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      } else {
        video.pause();
      }
    };

    video.addEventListener('click', start);
    cover.addEventListener('click', start);
    play.addEventListener('click', start);
    mute.addEventListener('click', function () {
      video.muted = !video.muted;
      mute.textContent = video.muted ? '取消静音' : '静音';
    });
    full.addEventListener('click', function () {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else if (video.requestFullscreen) {
        video.requestFullscreen();
      }
    });
    video.addEventListener('play', function () {
      box.classList.add('is-playing');
      box.classList.remove('is-paused');
      play.textContent = '暂停';
    });
    video.addEventListener('pause', function () {
      box.classList.remove('is-playing');
      box.classList.add('is-paused');
      play.textContent = '播放';
    });
    video.addEventListener('error', function () {
      box.classList.add('has-error');
    });
  }

  document.querySelectorAll('.video-box').forEach(init);
})();
