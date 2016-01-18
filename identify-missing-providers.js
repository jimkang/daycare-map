var queue = require('queue-async');

function identifyMissingProviders(db, ids, done) {
  var missing = [];
  var q = queue(10);
  ids.forEach(queueGet);
  q.awaitAll(passMissing);

  function queueGet(id) {
    q.defer(getProvider, id);
  }

  function getProvider(id, done) {
    db.get(id, evaluateResult);

    function evaluateResult(error) {
      if (error && error.type === 'NotFoundError') {
        missing.push(id);
        done();
      }
      else {
        done(error);
      }
    }
  }

  function passMissing(error) {
    if (error) {
      done(error);
    }
    else {
      done(error, missing);

      // Uncomment to awkwardly simulate slow response from server.
      // setTimeout(function () { done(error, missing); }, 10 * 1000);
    }
  }
}

module.exports = identifyMissingProviders;
