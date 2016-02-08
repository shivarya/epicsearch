module.exports = {
  fields: ['title', 'description'],
  primaryField: 'title',
  joins: [{
    fieldName: 'event',
    fields: ['title', 'startingDate', 'classification', 'city', 'venue'],
    primaryField: 'title'
  }]
}
