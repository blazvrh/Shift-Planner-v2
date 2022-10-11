const Schema = require("validate");

// zaposleni add
function validate_zaposlenAdd(zaposleniData, zapIdNedded) {
  const zaposlen = new Schema({
    zapID: {
      required: zapIdNedded,
      type: Number,
      size: { min: 1 },
      message: "Nekaj je šlo narobe!",
    },
    poslovalnica: {
      type: String,
      required: true,
      message: {
        type: 'Poslovalnica mora biti "string".',
        required: "Poslovalnica mora biti prisotna! Potrebna prijava?",
      },
    },
    imeZap: {
      type: String,
      required: true,
      length: { min: 1, max: 20 },
      message: {
        type: 'Ime zaposlenega mora biti "string".',
        required: "Ime zaposlenega ne sme biti prazno.",
        length: "Ime zaposlenega mora biti dolgo med 1 in 20 znakov.",
      },
    },
    priimekZap: {
      type: String,
      required: true,
      length: { min: 1, max: 20 },
      message: {
        type: 'Priimek zaposlenega mora biti "string".',
        required: "Priimek zaposlenega ne sme biti prazno.",
        length: "Priimek zaposlenega mora biti dolgo med 1 in 20 znakov.",
      },
    },
    prikazanoImeZap: {
      type: String,
      required: true,
      length: { min: 1, max: 20 },
      message: {
        type: 'Prikazano ime zaposlenega mora biti "string".',
        required: "Prikazano ime zaposlenega ne sme biti prazno.",
        length: "Prikazano ime zaposlenega mora biti dolgo med 1 in 20 znakov.",
      },
    },
    maxUrDanZap: {
      type: Number,
      required: true,
      size: { min: 1, max: 24 },
      message: {
        type: 'Max ur/dan mora biti "Number".',
        required: "Max ur/dan ne sme biti prazno.",
        size: "Max ur/dan mora biti med 1 in 24.",
      },
    },
    maxUrTedenZap: {
      type: Number,
      required: true,
      size: { min: 1, max: 168 },
      message: {
        type: 'Max ur/teden mora biti "Number".',
        required: "Max ur/teden ne sme biti prazno.",
        size: "Max ur/teden mora biti med 1 in 168.",
      },
    },
    maxNedelijZap: {
      type: Number,
      required: true,
      size: { min: 0 },
      message: {
        type: 'Max nedelij/leto mora biti "Number".',
        required: "Max nedelij/leto ne sme biti prazno.",
        size: "Max nedelij/leto mora biti pozitivno število.",
      },
    },
    maxPraznikovZap: {
      type: Number,
      required: true,
      size: { min: 0 },
      message: {
        type: 'Max parznikov/leto mora biti "Number".',
        required: "Max parznikov/leto ne sme biti prazno.",
        size: "Max parznikov/leto mora biti pozitivno število.",
      },
    },
    student: {
      type: Number,
      required: true,
      size: { min: 0, max: 1 },
      message: {
        type: 'Študent mora biti "Boolean number".',
        required: 'Študent mora biti "0" ali "1".',
        size: 'Študent mora biti "0" ali "1".',
      },
    },
    studentMlajsi: {
      type: Number,
      required: true,
      size: { min: 0, max: 1 },
      message: {
        type: 'Mlajši študent mora biti "Boolean number".',
        required: 'Mlajši študent mora biti "0" ali "1".',
        size: 'Mlajši študent mora biti "0" ali "1".',
      },
    },
  });

  return (errors = zaposlen.validate(zaposleniData));
}

module.exports.validate_zaposlenAdd = validate_zaposlenAdd;
// module.exports.validate_oddelekUpdate = validate_oddelekUpdate;
