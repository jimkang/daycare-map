function getSummaryDataFromProvider(provider) {
  var simpleRows = [
    {
      id: 'program-name',
      value: provider['Program Name']
    },
    {
      id: 'contact-name',
      value: provider['First Name'] + ' ' + provider['Last Name']
    },
    {
      id: 'address',
      value: provider['Address']
    },
    {
      id: 'city',
      value: provider['City']
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
    simpleRows: simpleRows
  };
}

module.exports = getSummaryDataFromProvider;
