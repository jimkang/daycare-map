var callNextTick = require('call-next-tick');
var pluck = require('lodash.pluck');
var pick = require('lodash.pick');

function ProviderDetailsRenderer(createOpts) {
  var providerStore;

  if (createOpts) {
    providerStore = createOpts.providerStore;
  }

  var detailsEl = createDetailsEl();
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
    var text;

    if (!provider) {
      text = 'Waiting for provider details to come from the Internet…';
    }
    else {
      var summary = pick(provider,
        'Program Name', 'providerid', 'First Name', 'Last Name', 'Address',
        'City', 'ZipCode', 'geodata'
      );
      text = JSON.stringify(summary, null, '  ');

      currentlyRenderedProviderId = provider.providerid;
    }
    
    if (text) {
      detailsEl.textContent = text;
    }

    return detailsEl;
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

function createDetailsEl() {
  var el = document.createElement('div');
  el.classList.add('provider-details');
  return el;
}

module.exports = ProviderDetailsRenderer;
