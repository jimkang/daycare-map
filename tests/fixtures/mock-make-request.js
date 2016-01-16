var url = require('url');
var callNextTick = require('call-next-tick');

function MockMakeRequest(opts) {
  var mockRequestChunkSize;
  var providersForIds;
  var reqOptsCheckers;

  if (opts) {
    mockRequestChunkSize = opts.mockRequestChunkSize;
    providersForIds = opts.providersForIds;
    reqOptsCheckers = opts.reqOptsCheckers;
  }

  var callCount = 0;

  function getMockProviderJSONForId(id) {
    return JSON.stringify(providersForIds[id]);
  }

  function mockMakeRequest(reqOpts) {
    if (reqOptsCheckers && reqOptsCheckers.length > callCount) {
      reqOptsCheckers[callCount](reqOpts);
    }
    callCount += 1;
    
    var parsed = url.parse(reqOpts.url);
    var idsToSend = parsed.pathname.split('/').pop().split(',');

    callNextTick(sendNextBatch);

    function sendNextBatch() {      
      var currentBatchIds = idsToSend.slice(0, mockRequestChunkSize);
      idsToSend.splice(0, mockRequestChunkSize);
      // console.log('currentBatchIds', currentBatchIds);

      reqOpts.onData(currentBatchIds.map(getMockProviderJSONForId).join('\n'));

      if (idsToSend.length > 0) {
        callNextTick(sendNextBatch);
      }
    }
  }

  return mockMakeRequest;
}

module.exports = MockMakeRequest;
