var accessor = require('accessor');
var summaryRowKey = accessor();
var getSummaryRowValue = accessor('value');

function renderSummary(summaryData, detailsSel) {
  detailsSel.text('');
  var summary = detailsSel.select('.summary');
  if (summary.empty()) {
    summary = detailsSel.append('ul').classed('summary', true);
  }

  var rowUpdate = summary.selectAll('li')
    .data(summaryData.simpleRows, summaryRowKey);
  rowUpdate.enter().append('li');
  rowUpdate.attr('id', summaryRowKey);
  rowUpdate.exit().remove();

  rowUpdate.text(getSummaryRowValue);
}

module.exports = renderSummary;
