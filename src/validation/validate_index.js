const Schema = require("validate");

function validate_predlogAdd(predlogData) {
  const predlog = new Schema({
    predlogTxt: {
      type: String,
      required: true,
      length: { min: 1, max: 300 },
      message: {
        type: 'Vnos polja mora biti v obliki "string".',
        required: "Vnos v polju mora biti prisoten!",
        length: "Vnos v polju mora vsebovati med 1 in 300 znakov!",
      },
    },
  });

  return (errors = predlog.validate(predlogData));
}

module.exports.validate_predlogAdd = validate_predlogAdd;
