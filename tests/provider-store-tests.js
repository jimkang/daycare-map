var test = require('tape');
var ProviderStore = require('../provider-store');
var url = require('url');
var callNextTick = require('call-next-tick');
var level = require('level');
var rimraf = require('rimraf');

var dbLocation = __dirname + '/test.db';

rimraf.sync(dbLocation);

test('Store test', function storeTest(t) {
  var mockProvidersForIds = {
    a: {
      providerid: 'a',
      name: 'Provider a'
    },
    b: {
      providerid: 'b',
      name: 'Provider b'
    },
    c: {
      providerid: 'c',
      name: 'Provider c'
    },
    d: {
      providerid: 'd',
      name: 'Provider d'
    },
    e: {
      providerid: 'e',
      name: 'Provider e'
    },
    f: {
      providerid: 'f',
      name: 'Provider f'
    },
    g: {
      providerid: 'g',
      name: 'Provider g'
    },
    h: {
      providerid: 'h',
      name: 'Provider h'
    }
  };


  function getMockProviderJSONForId(id) {
    return JSON.stringify(mockProvidersForIds[id]);
  }

  var mockRequestChunkSize = 3;
  var mockBatchSize = 4;

  function mockMakeRequest(reqOpts) {
    var parsed = url.parse(reqOpts.url);
    var idsToSend = parsed.pathname.split('/').pop().split(',');

    callNextTick(sendNextBatch);

    function sendNextBatch() {      
      var currentBatchIds = idsToSend.slice(0, mockRequestChunkSize);
      idsToSend.splice(0, mockRequestChunkSize);

      reqOpts.onData(currentBatchIds.map(getMockProviderJSONForId).join('\n'));

      if (idsToSend.length > 0) {
        callNextTick(sendNextBatch);
      }
    }
  }

  var db = level(
    dbLocation,
    {
      valueEncoding: 'json'
    }
  );

  var store = ProviderStore({
    makeRequest: mockMakeRequest,
    db: db,
    batchSize: mockBatchSize
  });

  var checkAllBatchesCallCount = 0;
  var checkBatch1CallCount = 0;
  var checkBatch2CallCount = 0;

  store.on('batch', checkBatch1);
  store.on('batch', checkAllBatches);
  store.on('error', checkError);

  store.loadProviders(['a', 'b', 'c']);

  function checkBatch1() {
    checkBatch1CallCount += 1;
    t.pass('Batch 1 event triggered.');
    store.removeListener('batch', checkBatch1);
    store.getProviders(['a', 'b', 'c', 'd'], checkGet1);
  }

  function checkGet1(error, providers) {
    t.ok(!error, 'No error during get 1.');
    if (error) {
      console.log(error, error.stack);
    }
    // TODO: Check providers.
    store.on('batch', checkBatch2);
    store.loadProviders(['d', 'e', 'f', 'g', 'h']);
  }

  function checkBatch2() {
    checkBatch2CallCount += 1;
    t.pass('Batch 2 event triggered.');
    if (checkBatch2CallCount === 2) {
      store.removeListener('batch', checkBatch2);
    }
    store.getProviders(['c', 'd', 'e', 'f', 'g'], checkGet2);
  }

  function checkGet2(error, providers) {
    t.ok(!error, 'No error during get 2.');
    // TODO: Check providers.

    if (checkBatch2CallCount === 2) {
      t.equal(checkBatch1CallCount, 1, 'One-time event listener called once.');
      t.equal(checkBatch2CallCount, 2, 'Two-time event listener called twice.');
      t.equal(
        checkAllBatchesCallCount, 3, 'Always-on event listener called thrice.'
      );
      t.end();
    }
  }

  function checkError(error) {
    t.fail('No errors emitted from store.');
    console.log(error, error.stack);
  }

  function checkAllBatches() {
    checkAllBatchesCallCount += 1;
  }  
});
