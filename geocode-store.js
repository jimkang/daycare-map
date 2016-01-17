var rbush = require('rbush');
var providerGeocodes = require('./geocoded-providers-summarized.json');
var accessors = require('./rbush-provider-accessors');

function GeocodeStore(createOpts) {
  if (createOpts) {
  }

  var tree = rbush(9);
  providerGeocodes.forEach(addToTree);

  function addToTree(d) {
    tree.insert([d.lng, d.lat, d.lng, d.lat, d.providerid]);
  }

  // Returns objects with latLng and providerid properties.
  // bounds should be a two-element array: SW and NE corner (lng, lat).
  function getProviderGeocodesInView(bounds) {
    var rbushPoints = tree.search(bounds);
    return rbushPoints.map(getGeocodeAndIdFromRbushPoint);
  }

  return {
    getProviderGeocodesInView: getProviderGeocodesInView
  };
}

function getGeocodeAndIdFromRbushPoint(rbushPoint) {
  return {
    latLng: accessors.getLatLngFromRbushPoint(rbushPoint),
    providerid: accessors.getProviderIdFromRbushPoint(rbushPoint)
  };
}

module.exports = GeocodeStore;
