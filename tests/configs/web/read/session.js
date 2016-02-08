module.exports = {
  fields: ['title', 'description', 'language'],
  primaryField: 'title',
  joins: [{
    fieldName: 'event',
    fields: ['title', 'startingDate', 'classification', 'city', 'venue', 'languages'],
    primaryField: 'title'
  }]
}
