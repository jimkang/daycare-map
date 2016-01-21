var DataJoiner = require('data-joiner');
var pluck = require('lodash.pluck');
var accessor = require('accessor');

function createRenderDataPoints(createOpts) {
  var map;
  var L;
  var providerStore;
  var geocodeStore;
  var renderDetailsForProviderId;

  if (createOpts) {
    map = createOpts.map;
    L = createOpts.L;
    providerStore = createOpts.providerStore;
    geocodeStore = createOpts.geocodeStore;
    renderDetailsForProviderId = createOpts.renderDetailsForProviderId;
  }

  var markers = new L.MarkerClusterGroup({
    disableClusteringAtZoom: 15,
    showCoverageOnHover: false
  });
  map.addLayer(markers);

  var markersForProviderIds = {};
  var joiner = DataJoiner({
    keyFn: accessor('providerid')
  });

  function render() {
    // console.log(map.getBounds().toBBoxString());
    var bounds = getSearchBounds(map);
    var providerGeocodes = geocodeStore.getProviderGeocodesInView(bounds);

    providerStore.loadProviders(
      pluck(providerGeocodes, 'providerid'),
      logProviderLoadDone
    );
    renderDataPoints(providerGeocodes);
  }

  function renderDataPoints(providerGeocodes) {
    joiner.update(providerGeocodes);

    joiner.exit().forEach(removeDataPoint);
    joiner.enter().forEach(renderDataPoint);
  }

  function renderDataPoint(providerGeocode) {
    var marker = L.marker(providerGeocode.latLng);
    
    markersForProviderIds[providerGeocode.providerid] = marker;
    marker.on('click', openDetails);

    markers.addLayer(marker);

    function openDetails() {
      renderDetailsForProviderId(providerGeocode.providerid, showPopup);
    }

    function showPopup(error, detailEl) {
      if (error) {
        console.log(error);
      }
      else {
        marker.bindPopup(detailEl).openPopup();
      }
    }
  }

  function removeDataPoint(providerGeocode) {
    var marker = markersForProviderIds[providerGeocode.providerid];
    if (marker) {
      markers.removeLayer(marker);
      delete markersForProviderIds[providerGeocode.providerid];
    }
  }

  return render;
}

function noOp() {
}

function getSearchBounds(map) {
  var bounds = map.getBounds();
  var sw = bounds.getSouthWest();
  var ne = bounds.getNorthEast();

  return [
    sw.lng, sw.lat,
    ne.lng, ne.lat
  ];
}

function logProviderLoadDone(error) {
  if (error) {
    console.log('Error while loading providers:', error);
  }
  else {
    console.log('Successfully loaded providers.');
  }
}

module.exports = createRenderDataPoints;
