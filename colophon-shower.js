var d3 = require('d3-selection');

function ColophonShower() {
  var colophon = d3.select('#colophon');
  var showLink = d3.select('#colophon-link');

  showLink.on('click', showColophon);

  function showColophon() {
    showLink.remove();
    colophon.classed('invisible', false).classed('visible', true);
  }
}

module.exports = ColophonShower;
