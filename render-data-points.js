var DataJoiner = require('data-joiner');

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

    marker.bindPopup(
      '<b>Provider ID:</b> ' + id
    )
    .openPopup();
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

module.exports = createRenderDataPoints;
