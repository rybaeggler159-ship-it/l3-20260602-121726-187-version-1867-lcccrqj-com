(function () {
  var toggle = document.querySelector('.menu-toggle');
  var mobile = document.querySelector('.mobile-nav');
  if (toggle && mobile) {
    toggle.addEventListener('click', function () {
      mobile.classList.toggle('open');
    });
  }

  document.querySelectorAll('form').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (input && !input.value.trim()) {
        event.preventDefault();
        input.focus();
      }
    });
  });

  var carousel = document.querySelector('.hero-carousel');
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
    var index = 0;
    var show = function (next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  var filterInput = document.querySelector('.local-filter');
  var yearSelect = document.querySelector('.year-filter');
  var grid = document.querySelector('.filter-grid');
  if (filterInput && yearSelect && grid) {
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    var years = [];
    cards.forEach(function (card) {
      var year = card.getAttribute('data-year') || '';
      if (year && years.indexOf(year) === -1) {
        years.push(year);
      }
    });
    years.sort().reverse().forEach(function (year) {
      var option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      yearSelect.appendChild(option);
    });
    var apply = function () {
      var query = filterInput.value.trim().toLowerCase();
      var yearValue = yearSelect.value;
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-year') || '',
          card.getAttribute('data-tags') || ''
        ].join(' ').toLowerCase();
        var year = card.getAttribute('data-year') || '';
        var ok = (!query || haystack.indexOf(query) !== -1) && (!yearValue || year === yearValue);
        card.style.display = ok ? '' : 'none';
      });
    };
    filterInput.addEventListener('input', apply);
    yearSelect.addEventListener('change', apply);
  }
})();
