var renderSummary = require('./render-summary');
var getSummaryDataFromProvider = require('./get-summary-data-from-provider');

function renderDetailsForProvider(provider, details) {
  if (!provider) {
    details.text('Waiting for provider details to come from the Internet…');
  }
  else {
    renderSummary(getSummaryDataFromProvider(provider), details);
    renderPhone(provider.Telephone, details);
  }

  return details.node();
}

function renderPhone(phone, details) {
  var phoneSel = details.select('.provider-phone');
  var phoneLink;
  if (phoneSel.empty()) {
    phoneSel = details.append('div').classed('provider-phone', true);
    phoneSel.append('a');
  }
  phoneLink = phoneSel.select('a');
  phoneLink.attr('href', 'tel:' + phone);
  phoneLink.text(formatPhone(phone));
}

function formatPhone(phone) {
  var formatted;
  var numberAndExt = phone.split('x');
  var number = numberAndExt[0];
  if (number.length === 10) {
    formatted = number.slice(0, 3) + '-' + number.slice(3, 6) + '-' + number.slice(6);
  }
  else {
    formatted = number;
  }

  if (numberAndExt.length > 1) {
    formatted += ' ' + 'Ext. ' + numberAndExt[1];
  }

  return formatted;
}

module.exports = renderDetailsForProvider;
