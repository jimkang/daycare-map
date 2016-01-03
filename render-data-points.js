function renderDataPoints(L, map, rbushPoints) {
  rbushPoints.forEach(renderDataPoint);

  function renderDataPoint(rbushPoint) {
    var marker = L.marker(getLatLngFromRbushPoint(rbushPoint)).addTo(map);
    marker.bindPopup(
      '<b>Provider ID:</b> ' + getProviderIdFromRbushPoint(rbushPoint)
    )
    .openPopup();
  }
}

function getProviderIdFromRbushPoint(point) {
  return point[4];
}

function getLatLngFromRbushPoint(point) {
  return [point[1], point[0]];
}

module.exports = renderDataPoints;
