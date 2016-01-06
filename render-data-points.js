var DataJoiner = require('data-joiner');
var makeRequest = require('basic-browser-request');

function createRenderDataPoints(createOpts) {
  var map;
  var L;
  var markersForProviderIds = {};

  if (createOpts) {
    map = createOpts.map;
    L = createOpts.L;
  }

  var joiner = DataJoiner({
    keyFn: getProviderIdFromRbushPoint
  });

  function renderDataPoints(rbushPoints) {
    joiner.update(rbushPoints);

    joiner.exit().forEach(removeDataPoint);
    joiner.enter().forEach(renderDataPoint);
  }

  function renderDataPoint(rbushPoint) {
    var marker = L.marker(getLatLngFromRbushPoint(rbushPoint)).addTo(map);
    var id = getProviderIdFromRbushPoint(rbushPoint);
    markersForProviderIds[id] = marker;

    marker.on('click', showProviderDetails);

    function showProviderDetails() {
      // TODO: Move the getting out of here.
      var requestHandle = makeRequest(
        {
          url: 'http://localhost:4999/providers/' + id,
          method: 'GET',
          mimeType: 'application/json',
          onData: function onData(data) {
            console.log(data);
            showProviderPopup(data);
            // chunksReceived += 1;
          }
        },
        noOp
      );
    }

    function showProviderPopup(text) {
      marker.bindPopup(text).openPopup();
    }
  }

  function removeDataPoint(rbushPoint) {
    var id = getProviderIdFromRbushPoint(rbushPoint);
    var marker = markersForProviderIds[id];
    if (marker) {
      map.removeLayer(marker);
      delete markersForProviderIds[id];
    }
  }

  return renderDataPoints;
}

function getProviderIdFromRbushPoint(point) {
  return point[4];
}

function getLatLngFromRbushPoint(point) {
  return [point[1], point[0]];
}

function noOp() {
}

module.exports = createRenderDataPoints;
