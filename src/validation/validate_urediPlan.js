const Schema = require("validate");

// week data add
function validate_weekData(weekData) {
  const week = new Schema({
    poslovalnica: {
      type: String,
      required: true,
      message: {
        type: 'Poslovalnica mora biti "string".',
        required: "Poslovalnica mora biti prisotna! Potrebna prijava?",
      },
    },
    weekNum: {
      type: Number,
      required: true,
      size: { min: -5, max: 60 },
      message: {
        type: 'Številka tedna mora biti "Number".',
        required: "Številka tedna ne sme biti prazna.",
        size: "Številka tedna mora biti med 1 in 54.",
      },
    },
    year: {
      type: Number,
      required: true,
      size: { min: 2010 },
      message: {
        type: 'Leto biti "Number".',
        required: "Leto biti prazno.",
        size: "Leto mora biti večje od 2010.",
      },
    },
    mondayDate: {
      type: String,
      required: true,
      length: { max: 10 },
      message: {
        type: 'Datum mora biti "string".',
        required: "Datum ne sme biti prazen.",
        length: "Zapis datuma ne sme biti daljši od 10 znakov.",
      },
    },
    sundayData: {
      required: true,
    },
    praznikiData: {},
  });

  return (errors = week.validate(weekData));
}

module.exports.validate_weekData = validate_weekData;
