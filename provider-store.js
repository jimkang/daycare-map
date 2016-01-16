var defaultMakeRequest = require('basic-browser-request');
var compact = require('lodash.compact');
process.hrtime = require('browser-process-hrtime');
var LevelBatch = require('level-batch-stream');
var createGetBatchUpdateCommands = require('./get-batch-update-commands');
var through = require('through2');
var queue = require('queue-async');
var identifyMissingProviders = require('./identify-missing-providers');

var batchCommandStreamOpts = {
  objectMode: true
};

function ProviderStore(opts) {
  var db;
  var makeRequest;
  var batchSize;
  var apiHost;

  if (opts) {
    db = opts.db;
    makeRequest = opts.makeRequest;
    batchSize = opts.batchSize;
    apiHost = opts.apiHost;
  }

  if (!makeRequest) {
    makeRequest = defaultMakeRequest;
  }

  getBatchUpdateCommands = createGetBatchUpdateCommands(opts);

  function loadProviders(ids, done) {
    identifyMissingProviders(db, ids, makeRequestForMissingIds);

    function makeRequestForMissingIds(error, missingIds) {
      if (error) {
        done(error);
      }
      else if (missingIds.length < 1) {
        done();
      }
      else {
        var batchCommandStream = through(
          batchCommandStreamOpts, getBatchUpdateCommands
        );    
        batchCommandStream.on('error', logCommandStreamError);
        batchCommandStream.pipe(new LevelBatch(db));

        makeRequest(
          {
            url: apiHost + '/providers/' + missingIds.join(','),
            method: 'GET',
            mimeType: 'application/json; charset=UTF-8',
            onData: writeToBatchCommandStream
          },
          done
        );
      }

      function writeToBatchCommandStream(data) {
        var lines = compact(data.split('\n'));
        var providers = lines.map(JSON.parse);
        batchCommandStream.write(providers);
      }
    }
  }

  function noOp() {
    console.log(providersForIds);
  }

  function addListener(eventType, listener) {
    db.on(eventType, listener);
  }

  function removeListener(eventType, listener) {
    db.removeListener(eventType, listener);
  }

  // getProviders gets you what's available. It will not pass back an error if
  // it cannot find one of the ids.
  function getProviders(ids, done) {
    var q = queue(10);
    ids.forEach(queueGet);
    q.awaitAll(clean);

    function queueGet(id) {
      q.defer(forgivingGet, id);
    }

    function clean(error, providers) {
      if (error) {
        done(error);
      }
      else {
        done(error, compact(providers));
      }
    }
  }

  function forgivingGet(id, done) {
    db.get(id, evaluateResult);

    function evaluateResult(error, provider) {
      if (!error || error.type === 'NotFoundError') {
        done(null, provider);
      }
      else {
        done(error, provider);
      }
    }
  }

  return {
    loadProviders: loadProviders,
    on: addListener,
    removeListener: removeListener,
    getProviders: getProviders
  };
}


function logCommandStreamError(error) {
  console.log(error, error.stack);
}

module.exports = ProviderStore;
