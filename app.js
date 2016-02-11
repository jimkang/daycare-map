var leaflet = require('leaflet');
require('leaflet.markercluster');
var makeRequest = require('basic-browser-request');
var levelup = require('levelup');
var leveljs = require('level-js');
var ProviderStore = require('./provider-store');
var GeocodeStore = require('./geocode-store');
var createRenderDataPoints = require('./render-data-points');
var ProviderDetailsRenderer = require('./provider-details-renderer');
var pluck = require('lodash.pluck');

L.Icon.Default.imagePath = 'http://api.tiles.mapbox.com/mapbox.js/v2.2.1/images';

var bostonPoint = [42.3725, -71.1266];
var somervillePoint = [42.39, -71.1];

var map = L.map('map').setView(bostonPoint, 14);
var publicAccessToken = 'pk.eyJ1IjoiZGVhdGhtdG4iLCJhIjoiY2lpdzNxaGFqMDAzb3Uya25tMmR5MDF6ayJ9.ILyMA2rUQZ6nzfa2xT41KQ';
var tileURL = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' +
  publicAccessToken;

var tileLayerOpts = {
  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
  maxZoom: 20,
  minZoom: 9,
  id: 'mapbox.streets',
  accessToken: publicAccessToken
};

L.tileLayer(tileURL, tileLayerOpts).addTo(map);

var providerStore = ((function setUpStore() {
  var db = levelup(
    'daycare',
    {
      db: leveljs,
      valueEncoding: 'json'
    }
  );

  return ProviderStore({
    makeRequest: makeRequest,
    db: db,
    apiHost: 'http://45.55.32.243:4999'
    // apiHost: 'http://localhost:4999'
  });
})());

var geocodeStore = GeocodeStore();

var providerDetailsRenderer = ProviderDetailsRenderer({
  providerStore: providerStore
});

var render = createRenderDataPoints({
  L: leaflet,
  map: map,
  providerStore: providerStore,
  geocodeStore: geocodeStore,
  renderDetailsForProviderId: providerDetailsRenderer.renderDetailsForProviderId
});

render();

map.on('viewreset', render);
map.on('dragend', render);
providerStore.on('batch', refreshProviderDetails);

function refreshProviderDetails(newRecords) {
  providerDetailsRenderer.notifyOfChangedProviders(pluck(newRecords, 'value'));
}
