var callNextTick = require('call-next-tick');
var pluck = require('lodash.pluck');
var d3 = require('d3-selection');
var renderSummary = require('./render-summary');
var getSummaryDataFromProvider = require('./get-summary-data-from-provider');

function ProviderDetailsRenderer(createOpts) {
  var providerStore;

  if (createOpts) {
    providerStore = createOpts.providerStore;
  }

  var details = d3.select(document.createElement('div'))
    .attr('id', 'provider-details');

  var currentlyRenderedProviderId;

  function renderDetailsForProviderId(providerid, done) {
    if (currentlyRenderedProviderId === providerid) {
      callNextTick(done);
    }
    else {
      providerStore.getProvider(providerid, useProvider);
    }

    function useProvider(error, provider) {
      if (error) {
        done(error);
      }
      else {
        currentlyRenderedProviderId = providerid;
        done(null, renderDetailsForProvider(provider));
      }
    }
  }

  function renderDetailsForProvider(provider) {
    if (!provider) {
      details.text('Waiting for provider details to come from the Internet…');
    }
    else {
      renderSummary(getSummaryDataFromProvider(provider), details);
      currentlyRenderedProviderId = provider.providerid;
    }

    return details.node();
  }

  function notifyOfChangedProviders(providers) {
    var ids = pluck(providers, 'providerid');
    var currentlyRenderedIndex = ids.indexOf(currentlyRenderedProviderId);

    if (currentlyRenderedIndex !== -1) {
      renderDetailsForProvider(providers[currentlyRenderedIndex]);
    }
  }

  return {
    renderDetailsForProviderId: renderDetailsForProviderId,
    renderDetailsForProvider: renderDetailsForProvider,
    notifyOfChangedProviders: notifyOfChangedProviders
  };
}

module.exports = ProviderDetailsRenderer;
