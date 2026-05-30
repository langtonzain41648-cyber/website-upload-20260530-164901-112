import { H as Hls } from './hls.js';

const roots = document.querySelectorAll('[data-player]');

roots.forEach(root => {
  const video = root.querySelector('video');
  const layer = root.querySelector('[data-play-layer]');
  const buttons = root.querySelectorAll('[data-play-button]');
  const source = video ? video.getAttribute('data-hls') : '';
  let attached = false;
  let hls = null;

  const attach = () => {
    if (!video || !source || attached) {
      return;
    }

    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    if (Hls.isSupported()) {
      hls = new Hls({
        maxBufferLength: 30,
        enableWorker: true,
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      return;
    }

    video.src = source;
  };

  const play = () => {
    attach();
    if (layer) {
      layer.classList.add('is-hidden');
    }
    const attempt = video.play();
    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(() => {
        window.setTimeout(() => {
          video.play().catch(() => {
            if (layer) {
              layer.classList.remove('is-hidden');
            }
          });
        }, 480);
      });
    }
  };

  buttons.forEach(button => button.addEventListener('click', play));

  if (video) {
    video.addEventListener('click', () => {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener('play', () => {
      if (layer) {
        layer.classList.add('is-hidden');
      }
    });

    video.addEventListener('pause', () => {
      if (video.currentTime === 0 && layer) {
        layer.classList.remove('is-hidden');
      }
    });

    video.addEventListener('error', () => {
      if (hls) {
        hls.destroy();
        hls = null;
      }
      attached = false;
    });
  }
});
