var makeRequest = require('basic-browser-request');
var compact = require('lodash.compact');

function ProviderStore() {
  // In-memory for now.
  var providersForIds = {};

  function loadProviders(ids) {
    makeRequest(
      {
        url: 'http://localhost:4999/providers/' + ids.join(','),
        method: 'GET',
        mimeType: 'application/json; charset=UTF-8',

        onData: function onData(data) {
          var lines = data.split('\n');
          console.log('lines count:', lines.length);
          console.log('lines', lines);
          lines = compact(lines);
          providers = lines.map(JSON.parse);
          providers.forEach(saveProvider);
        }
      },
      noOp
    );
  }

  function saveProvider(provider) {
    providersForIds[provider.providerid] = provider;
  }

  function getProvider(id, done) {
    // If you have it, give it. If you don't start loading it.
    // Actually, see if you're currently trying to load it.
  }


function noOp() {
  console.log(providersForIds);
}

  return {
    loadProviders: loadProviders
  };
}


module.exports = ProviderStore;
