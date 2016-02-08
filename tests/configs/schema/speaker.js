module.exports = {
  type: {
    isRequired: true,
    type: String,
    multiLingual: true,
    english: {
      label: 'Translator',
      enum: ['Translator']
    },
    french: {
      label: 'TranslaorFr',
      enum: ['TranslatorFr']
    }
  },
  language: {
    isRequired: true,
    type: String,
    multiLingual: true,
    english: {
      label: 'Languages',
      enum: ['English', 'Tibetan', 'Hindi', 'French'],
    },
    french: {
      label: 'LanguagesFr',
      enum: ['EnglishFr', 'TibetanFr', 'HindiFr', 'FrenchFr'],
    }
  },
  person: {
    type: ['session']
  }
}
