var callNextTick = require('call-next-tick');

function getBatchUpdateCommands(providers, enc, cb) {
  callNextTick(cb, null, providers.map(updateParamsForProvider));
}

function updateParamsForProvider(provider) {
  var params = {
    type: 'put',
    key: provider.providerid,
    value: provider
  };

  return params;
}

module.exports = getBatchUpdateCommands;
