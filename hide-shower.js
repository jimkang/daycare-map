var d3 = require('d3-selection');

function HideShower() {
  var colophon = d3.select('#colophon');
  var showLink = d3.select('#colophon-link');
  var dismissExplanationLink = d3.select('#dismiss-explanation-link');
  var explanation = d3.select('.explanation');
  var map = d3.select('#map');

  showLink.on('click', showColophon);
  dismissExplanationLink.on('click', dismissExplanation);

  function showColophon() {
    showLink.remove();
    colophon.classed('invisible', false).classed('visible', true);
  }

  function dismissExplanation() {
    explanation.remove();
    map.classed('most-of-the-way-height', false).classed('full-height', true);
  }
}

module.exports = HideShower;
