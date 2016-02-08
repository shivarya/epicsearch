module.exports = {

  name: {
    isRequired: true,
    type: String,
    english: {
      label: 'Name',
    },
    french: {
      label: 'Prénom',
    }
  },
  creationTime: {
    isRequired: true,
    type: Date,
    english: {
      label: 'Creation Time',
    },
    french: {
      label: 'Time de début',
    }
  },
  size: {
    isRequired: true,
    type: Number,
    english: {
      label: 'Size',
    },
    french: {
      label: 'Taille',
    }
  },
  urls: {
    type: [String],
    english: {
      label: 'Urls',
    },
    french: {
      label: 'Urls',
    }
  },
  hdLocations: {
    type: [{
      name: {
        isRequired: true,
        type: String,
        english: {
          label: 'Name',
        },
        french: {
          label: 'Prénom',
        }
      },
      path: {
        isRequired: true,
        type: String,
        english: {
          label: 'Path',
        },
        french: {
          label: 'Chemin',
        }
      },
    }],
    english: {
      label: 'Hard Disks'
    },
    french: {
      label: 'Disques durs'
    }
  }
}
