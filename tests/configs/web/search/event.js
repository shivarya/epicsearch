module.exports = {
  fields: ['title', 'startingDate', 'classification', 'city', 'venue'],
  primaryField: 'title',
  joins: [{
    fieldName: 'sessions',
    fields: ['title', 'description'],
    primaryField: 'title'
  }]
}
