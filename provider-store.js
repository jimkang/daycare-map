var defaultMakeRequest = require('basic-browser-request');
var compact = require('lodash.compact');
var LevelBatch = require('level-batch-stream');
var createGetBatchUpdateCommands = require('./get-batch-update-commands');
var through = require('through2');
var queue = require('queue-async');

var batchCommandStreamOpts = {
  objectMode: true
};

function ProviderStore(opts) {
  var db;
  var makeRequest;
  var batchSize;

  if (opts) {
    db = opts.db;
    makeRequest = opts.makeRequest;
    batchSize = opts.batchSize;
  }

  if (!makeRequest) {
    makeRequest = defaultMakeRequest;
  }

  getBatchUpdateCommands = createGetBatchUpdateCommands(opts);
  // var idsBeingWaitedOn = [];

  function loadProviders(ids) {
    var batchCommandStream = through(
      batchCommandStreamOpts, getBatchUpdateCommands
    );    
    batchCommandStream.on('error', logCommandStreamError);
    batchCommandStream.pipe(new LevelBatch(db));

    function logCommandStreamError(error) {
      console.log(error, error.stack);
    }

    makeRequest(
      {
        url: 'http://localhost:4999/providers/' + ids.join(','),
        method: 'GET',
        mimeType: 'application/json; charset=UTF-8',
        onData: writeToBatchCommandStream
      },
      noOp
    );

    function writeToBatchCommandStream(data) {
      var lines = data.split('\n');
      console.log('lines count:', lines.length);
      console.log('lines', lines);
      debugger;
      lines = compact(lines);
      var providers = lines.map(JSON.parse);
      batchCommandStream.write(providers);
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
    q.awaitAll(done);

    function queueGet(id) {
      q.defer(forgivingGet, id);
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

module.exports = ProviderStore;
