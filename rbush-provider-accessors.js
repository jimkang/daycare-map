function getProviderIdFromRbushPoint(point) {
  return point[4];
}

function getLatLngFromRbushPoint(point) {
  return [point[1], point[0]];
}

module.exports = {
  getProviderIdFromRbushPoint: getProviderIdFromRbushPoint,
  getLatLngFromRbushPoint: getLatLngFromRbushPoint
};
