(function () {
    function createPlayer(root) {
        var video = root.querySelector('video');
        var overlay = root.querySelector('[data-play-overlay]');
        var config = root.querySelector('[data-stream-config]');
        var hls = null;
        var initialized = false;

        if (!video || !overlay || !config) {
            return;
        }

        function getSource() {
            try {
                return JSON.parse(config.textContent || '{}').source || '';
            } catch (error) {
                return '';
            }
        }

        function attachSource(source) {
            if (!source) {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                return;
            }
            video.src = source;
        }

        function startPlayback() {
            if (!initialized) {
                attachSource(getSource());
                initialized = true;
            }
            overlay.hidden = true;
            video.controls = true;
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    overlay.hidden = false;
                });
            }
        }

        overlay.addEventListener('click', startPlayback);
        video.addEventListener('click', function () {
            if (video.paused) {
                startPlayback();
            }
        });
        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    document.querySelectorAll('[data-video-player]').forEach(createPlayer);
})();
