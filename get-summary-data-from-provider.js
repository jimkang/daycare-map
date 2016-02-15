var toTitleCase = require('titlecase');

function getSummaryDataFromProvider(provider) {
  var simpleRows = [
    {
      id: 'program-name',
      value: normalize(provider['Program Name'])
    },
    {
      id: 'type',
      value: provider['Type of care']
    },
    // {
    //   id: 'contact-name',
    //   value: provider['First Name'] + ' ' + provider['Last Name']
    // },
    {
      id: 'address',
      value: normalize(provider['Address'])
    },
    {
      id: 'city-and-state',
      value: normalize(provider['City']) + ', ' + 'MA'
    },
    {
      id: 'zip',
      value: provider['ZipCode']
    }
  ];

  return {
    latLng: {
      lat: provider.lat,
      lng: provider.lng
    },
    providerid: provider.providerid,
    simpleRows: simpleRows,
    phone: provider['Telephone']
  };
}

function normalize(s) {
  return toTitleCase(s.toLowerCase());
}

module.exports = getSummaryDataFromProvider;
