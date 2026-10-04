// LAVA Dental Studio - Interactive Image Comparison Slider
(function () {
  function initComparisonSlider(container) {
    if (!container || container.dataset.sliderInitialized) return;
    container.dataset.sliderInitialized = 'true';

    const handle = container.querySelector('.image-compare__handle');
    let isDragging = false;

    function setPosition(xPercent) {
      const clamped = Math.max(0, Math.min(100, xPercent));
      container.style.setProperty('--clip-pos', clamped + '%');
    }

    function onPointerMove(e) {
      if (!isDragging) return;
      const rect = container.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const pos = ((clientX - rect.left) / rect.width) * 100;
      setPosition(pos);
    }

    function onPointerUp() {
      if (isDragging) {
        isDragging = false;
        document.removeEventListener('mousemove', onPointerMove);
        document.removeEventListener('mouseup', onPointerUp);
        document.removeEventListener('touchmove', onPointerMove);
        document.removeEventListener('touchend', onPointerUp);
      }
    }

    function onPointerDown(e) {
      isDragging = true;
      e.preventDefault();
      document.addEventListener('mousemove', onPointerMove);
      document.addEventListener('mouseup', onPointerUp);
      document.addEventListener('touchmove', onPointerMove, { passive: false });
      document.addEventListener('touchend', onPointerUp);

      // Also set position directly on click/tap
      const rect = container.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const pos = ((clientX - rect.left) / rect.width) * 100;
      setPosition(pos);
    }

    container.addEventListener('mousedown', onPointerDown);
    container.addEventListener('touchstart', onPointerDown, { passive: false });

    // Keyboard support
    container.setAttribute('tabindex', '0');
    container.addEventListener('keydown', (e) => {
      const currentPos = parseFloat(container.style.getPropertyValue('--clip-pos') || '50');
      if (e.key === 'ArrowLeft') {
        setPosition(currentPos - 5);
        e.preventDefault();
      } else if (e.key === 'ArrowRight') {
        setPosition(currentPos + 5);
        e.preventDefault();
      }
    });

    // Default position 50%
    setPosition(50);
  }

  window.initComparisonSliders = function (root = document) {
    const sliders = root.querySelectorAll('.image-compare-container');
    sliders.forEach(initComparisonSlider);
  };

  document.addEventListener('DOMContentLoaded', () => {
    window.initComparisonSliders();
  });
})();
