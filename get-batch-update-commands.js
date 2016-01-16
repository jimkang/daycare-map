var queue = require('queue-async');

function createGetBatchUpdateCommands(opts) {
  var db;

  if (opts) {
    db = opts.db;
  }

  // Will *skip* creating update commands for providers that already exist in
  // the database.
  function getBatchUpdateCommands(providers, enc, cb) {
    var commands = [];
    var q = queue(10);
    providers.forEach(queueParamGen);
    q.awaitAll(passCommmands);

    function queueParamGen(provider) {
      q.defer(addUpdateParamsIfProviderIsNotSaved, provider);
    }

    function addUpdateParamsIfProviderIsNotSaved(provider, done) {
      providerIsSaved(provider, decideParams);

      function decideParams(error, isSaved) {
        if (error) {
          // Not stopping for errors.
          console.log(error, error.stack);
        }
        if (!isSaved) {
          commands.push(updateParamsForProvider(provider));
        }
        done(error);
      }
    }

    function passCommmands() {
      cb(null, commands);
    }
  }

  return getBatchUpdateCommands;

  function providerIsSaved(provider, done) {
    var isSaved = false;
    db.get(provider.providerid, checkGet);

    function checkGet(error, value) {
      if (!error && value) {
        isSaved = true;
      }
      done(null, isSaved);
    }
  }
}

function updateParamsForProvider(provider) {
  var params = {
    type: 'put',
    key: provider.providerid,
    value: provider
  };

  return params;
}

module.exports = createGetBatchUpdateCommands;
