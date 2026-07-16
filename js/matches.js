/* Highlight next upcoming fixture */
document.addEventListener('DOMContentLoaded', function () {
  var rows = document.querySelectorAll('.fixture-row[data-target]');
  var now = Date.now();

  for (var i = 0; i < rows.length; i++) {
    var target = new Date(rows[i].dataset.target).getTime();
    if (target > now) {
      rows[i].classList.add('fixture-row--next');
      break;
    }
  }
});
