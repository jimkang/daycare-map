function RenderProviderDetails(opts) {
  var marker;
  var providerStore;
  var providerid;

  if (opts) {
    marker = opts.marker;
    providerStore = opts.providerStore;
    providerid = opts.providerid;
  }

  function renderProviderDetails(marker) {
    providerStore.getProviders([providerid], showProviderPopup);
  }

  function showProviderPopup(error, providers) {
    var text;
    if (error) {
      console.log(error);
    }
    if (providers.length < 1) {
      text = 'Waiting for provider details to come from the Internet…';
    }
    else {
      text = JSON.stringify(providers[0], null, '  ');
    }
    
    if (text) {
      marker.bindPopup(text).openPopup();
    }
  }

  return renderProviderDetails;
}

module.exports = RenderProviderDetails;
