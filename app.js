var leaflet = require('leaflet');
var rbush = require('rbush');
var renderDataPoints = require('./render-data-points');
var geocodedProviders = require('./geocoded-providers-summarized.json');

L.Icon.Default.imagePath = 'http://api.tiles.mapbox.com/mapbox.js/v2.2.1/images';

var bostonPoint = [42.3725, -71.1266];
var somervillePoint = [42.39, -71.1];

var map = L.map('map').setView(bostonPoint, 14);
var publicAccessToken = 'pk.eyJ1IjoiZGVhdGhtdG4iLCJhIjoiY2lpdzNxaGFqMDAzb3Uya25tMmR5MDF6ayJ9.ILyMA2rUQZ6nzfa2xT41KQ';
var tileURL = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' +
  publicAccessToken;

var tileLayerOpts = {
  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
  maxZoom: 18,
  id: 'mapbox.streets',
  accessToken: publicAccessToken
};

L.tileLayer(tileURL, tileLayerOpts).addTo(map);

var tree = rbush(9);

geocodedProviders.forEach(addToTree);

function addToTree(d) {
  tree.insert([d.lng, d.lat, d.lng, d.lat, d.providerid]);
}

map.on('viewreset', updateMarkers);
map.on('dragend', updateMarkers);

updateMarkers();

function updateMarkers() {
  console.log(map.getBounds().toBBoxString());
  var inViewProviders = tree.search(getSearchBounds(map));
  renderDataPoints(L, map, inViewProviders);
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
