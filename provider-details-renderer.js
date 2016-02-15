var callNextTick = require('call-next-tick');
var pluck = require('lodash.pluck');
var d3 = require('d3-selection');
var renderDetailsForProvider = require('./render-details-for-provider');

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
        done(null, renderDetailsForProvider(provider, details));
      }
    }
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
    // renderDetailsForProvider: renderDetailsForProvider,
    notifyOfChangedProviders: notifyOfChangedProviders
  };
}

module.exports = ProviderDetailsRenderer;
