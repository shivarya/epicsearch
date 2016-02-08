var _ = require('lodash')
var fileSchema = _.clone(require('./file'))

module.exports = _.extend(fileSchema, {
  numberOfStreams: {
    isRequired: true,
    type: Number,
    english: {
      label: 'Number of streams',
    },
    french: {
      label: 'Nombre de flux',
    }
  },
  raw: {
    isRequired: true,
    defaultValue: false,
    type: Boolean,
    english: {
      label: 'Raw',
    },
    french: {
      label: 'Brut',
    }
  },
  formatName: {
    isRequired: true,
    type: String,
    english: {
      label: 'Format name',
    },
    french: {
      label: 'Nom de format',
    }
  },
  formatLongName: {
    isRequired: true,
    type: String,
    english: {
      label: 'Format name',
    },
    french: {
      label: 'Nom de format à long',
    }
  },
  duration: {
    isRequired: true,
    type: Number,
    english: {
      label: 'Duration',
    },
    french: {
      label: 'Durée',
    }
  },
  bitRate: {
    type: Number,
    isRequired: true,
    english: {
      label: 'Bit rate',
    },
    french: {
      label: 'Taux de bits',
    }
  },
  majorBrand: {
    isRequired: true,
    type: String,
    english: {
      label: 'Major brand',
    },
    french: {
      label: 'Grande marque',
    }
  },
  compatibleBrands: {
    type: String,
    english: {
      label: 'Compatible brands',
    },
    french: {
      label: 'Marques compatibles',
    }
  },
  events: {
    type: ['event']
  },
  sessions: {
    type: ['session']
  },
  streams: {
    type: [{
      codecName: {
        isRequired: true,
        type: String,
        english: {
          label: 'Codec Name',
        },
        french: {
          label: 'Nom de codec',
        }
      },
      codecLongName: {
        isRequired: true,
        type: String,
        english: {
          label: 'Codec long name',
        },
        french: {
          label: 'Codec nom long',
        }
      },
      codecType: {
        isRequired: true,
        type: String,
        english: {
          label: 'Codec Type',
        },
        french: {
          label: 'Type de codec',
        }
      },
      codecTagString: {
        type: String,
        english: {
          label: 'Codec Tag String',
        },
        french: {
          label: 'Codec Tag String',
        }
      },
      sampleRate: {
        type: Number,
        english: {
          label: 'Sample rate',
        },
        french: {
          label: 'Taux d\'échantillonnage',
        }
      },
      channels: {
        isRequired: true,
        type: Number,
        english: {
          label: 'Channels',
        },
        french: {
          label: 'Filières',
        }
      },
      bitsPerSample: {
        type: Number,
        english: {
          label: 'Bits per sample',
        },
        french: {
          label: 'Bits par échantillon',
        }
      },
      frameRate: {
        type: Number,
        english: {
          label: 'Frame rate',
        },
        french: {
          label: 'Taux de frame ',
        }
      },
      duration: {
        type: Number,
        isRequired: true,
        english: {
          label: 'Duration',
        },
        french: {
          label: 'Durée',
        }
      },
      language: {
        type: String,
        english: {
          label: 'Language',
        },
        french: {
          label: 'Langues',
        }
      },
      width: {
        type: Number,
        english: {
          label: 'Width',
        },
        french: {
          label: 'Largeur',
        }
      },
      heigth: {
        type: Number,
        english: {
          label: 'Height',
        },
        french: {
          label: 'Hauteur',
        }
      },
      pixelFormat: {
        type: String,
        english: {
          label: 'Pixel format',
        },
        french: {
          label: 'Format de pixel',
        }
      },
    }]
  }
})
