var callNextTick = require('call-next-tick');
var pluck = require('lodash.pluck');
var d3 = require('d3-selection');
var accessor = require('accessor');

var summaryRowKey = accessor();
var getSummaryRowValue = accessor('value');

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
      renderSummary(provider);
      currentlyRenderedProviderId = provider.providerid;
    }

    return details.node();
  }

  function renderSummary(provider) {
    var summary = details.select('.summary');
    if (summary.empty()) {
      summary = details.append('ul').classed('summary', true);
    }

    var summaryData = getSummaryData(provider);
    var rowUpdate = summary.selectAll('li')
      .data(summaryData.simpleRows, summaryRowKey);

    rowUpdate.enter().append('li');
    rowUpdate.exit().remove();

    rowUpdate.text(getSummaryRowValue);
  }

  function getSummaryData(provider) {
    var simpleRows = [
      {
        id: 'program-name',
        value: provider['Program Name']
      },
      {
        id: 'contact-name',
        value: provider['First Name'] + ' ' + provider['Last Name']
      },
      {
        id: 'address',
        value: provider['Address']
      },
      {
        id: 'city',
        value: provider['City']
      },
      {
        id: 'zip',
        value: provider['ZipCode']
      }
    ];

    return {
      latLng: {
        lat: provider.lat,
        lng: provider.lng
      },
      providerid: provider.providerid,
      simpleRows: simpleRows
    };
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
