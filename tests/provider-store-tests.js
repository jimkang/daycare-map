var test = require('tape');
var ProviderStore = require('../provider-store');
var level = require('level');
var rimraf = require('rimraf');
var MockMakeRequest = require('./fixtures/mock-make-request');
var curry = require('lodash.curry');

var dbLocation = __dirname + '/test.db';

rimraf.sync(dbLocation);

test('Store test', function storeTest(t) {
  var mockRequestChunkSize = 3;

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

  var mockMakeRequest = MockMakeRequest({
    mockRequestChunkSize: mockRequestChunkSize,
    providersForIds: mockProvidersForIds,
    reqOptsCheckers: [
      checkReq1,
      checkReq2
    ]
  });

  var db = level(
    dbLocation,
    {
      valueEncoding: 'json'
    }
  );

  var store = ProviderStore({
    makeRequest: mockMakeRequest,
    db: db
  });

  var checkAllBatchesCallCount = 0;
  var checkBatch1CallCount = 0;
  var checkBatch2CallCount = 0;

  store.on('batch', checkBatch1);
  store.on('batch', checkAllBatches);
  store.on('error', checkError);

  store.loadProviders(['a', 'b', 'c']);

  function checkForIdInReq(ids, id) {
    t.ok(ids.indexOf(id) !== -1, 'Request contains ' + id);
  }

  function checkReq1(reqOpts) {
    var ids = getIdsFromURL(reqOpts.url);
    t.equal(ids.length, 3, 'Request 1 has the correct number of ids.');
    ['a', 'b', 'c'].forEach(curry(checkForIdInReq)(ids));
  }

  function checkBatch1() {
    checkBatch1CallCount += 1;
    t.pass('Batch 1 event triggered.');
    debugger;
    store.removeListener('batch', checkBatch1);
    store.getProviders(['a', 'b', 'c', 'd'], checkGet1);
  }

  function checkGet1(error, providers) {
    t.ok(!error, 'No error during get 1.');
    if (error) {
      console.log(error, error.stack);
    }
    
    t.equal(
      providers.length,
      mockRequestChunkSize,
      'Correct number of providers returned for get 1.'
    );
    t.deepEqual(providers[0], mockProvidersForIds['a'], 'Provider a gotten.');
    t.deepEqual(providers[1], mockProvidersForIds['b'], 'Provider b gotten.');
    t.deepEqual(providers[2], mockProvidersForIds['c'], 'Provider c gotten.');

    store.on('batch', checkBatch2);
    store.loadProviders(['b', 'c', 'd', 'e', 'f', 'g', 'h']);
  }

  function checkReq2(reqOpts) {
    var ids = getIdsFromURL(reqOpts.url);
    // Even though the loadProviders call includes b and c, those should
    // already be loaded. No call should have to be made for those two.
    // TODO: Expiration. Maybe indexedDB as expiration built-in?
    t.equal(ids.length, 5, 'Request 2 has the correct number of ids.');
    ['d', 'e', 'f', 'g', 'h'].forEach(curry(checkForIdInReq)(ids));
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

    // mockRequestChunkSize is 4, but a-c were pushed in the previous batch, so
    // c, in addition to d-f, should be available.
    // The second time this is called, g-h should also be available, hence,
    // different expected lengths each time.
    t.equal(
      providers.length,
      checkBatch2CallCount === 1 ? 4: 5,
      'Correct number of providers returned for get 2.'
    );

    t.deepEqual(providers[0], mockProvidersForIds['c'], 'Provider c gotten.');
    t.deepEqual(providers[1], mockProvidersForIds['d'], 'Provider d gotten.');
    t.deepEqual(providers[2], mockProvidersForIds['e'], 'Provider e gotten.');
    t.deepEqual(providers[3], mockProvidersForIds['f'], 'Provider f gotten.');

    if (checkBatch2CallCount === 2) {
      t.deepEqual(providers[4], mockProvidersForIds['g'], 'Provider g gotten.');

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

function getIdsFromURL(url) {
  var parts = url.split('/');
  var ids;

  if (parts.length > 0) {
    idsString = parts[parts.length - 1];
    ids = idsString.split(',');
  }

  return ids;
}
