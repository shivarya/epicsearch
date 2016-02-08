module.exports = {
  fields: ['name', 'creationTime', 'size', 'urls', 'numberOfStreams', 'raw', 'formatName', 'formatLongName', 'majorBrand', 'duration', 'compatibleBrands'],
  primaryField: 'name',
  joins: [{
    fieldName: 'sessions',
    fields: ["title"],
    primaryField: 'title'
  }, {
    fieldName: 'events',
    fields: ['title', 'startingDate', 'country', 'city'],
    primaryField: 'name',
  }]
}
