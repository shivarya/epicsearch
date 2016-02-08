module.exports = {
  fields: ['type', 'language'],
  primaryField: 'title',
  joins: [{
    fieldName: 'person',
    fields: ["name"]
  }]
}
