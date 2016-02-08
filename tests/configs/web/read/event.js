module.exports = {
  fields: ['title', 'classification', 'description', 'startingDate', 'endingDate', 'country', 'city', 'state', 'venue', 'keywords', 'languages'],
  primaryField: 'title',
  joins: [{
    fieldName: 'sessions',
    fields: ['title', 'description'],
    primaryField: 'title'
  }, {
    fieldName: 'persons',
    fields: ['name'],
    primaryField: 'name',
  }, {
    fieldName: 'speakers',
    fields: ['type', 'language'],
    primaryField: 'person.name',
    joins: [{
      fieldName: 'person',
      fields: ["name"]
    }]
  }]
}
