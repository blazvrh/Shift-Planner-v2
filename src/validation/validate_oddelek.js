
const Schema = require("validate");

// oddelek add
function validate_oddelekAdd (oddData) {
    const oddelek = new Schema({
        poslovalnica: {
            type: String,
            required: true,
            message: {
                type: "Poslovalnica mora biti \"string\".",
                required: "Poslovalnica mora biti prisotna! Potrebna prijava?"
            }
        },
        positionForUser: {
            type: Number,
            required: true,
            message: {
                type: "Polozaj mora biti \"number\".",
                required: "Polozaj mora biti prisoten!"
            }
        },
        imeOddelka: {
            type: String,
            required: true,
            length: { min: 1, max: 20 },
            message: {
                type: "Ime oddelka mora biti \"string\".",
                required: "Ime oddelka ne sme biti prazno.",
                length: "Ime oddelka mora biti dolgo med 1 in 20 znakov."
            }
        },
        smena: {
            type: String,
            required: true,
            message: {
                type: "Smena mora biti \"string\".",
                required: "Smena ne sme biti prazna."
            }
        },
        stVrsticOddelka: {
            type: Number,
            required: true,
            size: { min: 1, max: 20 },
            message: {
                type: "Število vrstic za oddelek mora biti \"Number\".",
                required: "Število vrstic za oddelek ne sme biti prazno.",
                size: "Število vrstic za oddelek mora biti med 1 in 20."
            }
        },
        prihod: {
            type: String,
            message: {
                type: "Prihod na oddelek mora biti \"string\"."
            }
        },
        odhod: {
            type: String,
            message: {
                type: "Odhod na oddelek mora biti \"string\"."
            }
        },
        specialOddelek: {
            type: String,
            message: {
                type: "Posebnost oddelka mora biti \"string\"."
            }
        }
    });
    
    return errors = oddelek.validate(oddData);
}

// oddelek update
function validate_oddelekUpdate (oddData) {
    const oddelek1 = new Schema({
        oddID: {
            type: Number,
            required: true,
            message: {
                type: "ID mora biti \"number\".",
                required: "ID mora biti prisoten!"
            }
        },
        positionForUser: {
            type: Number,
            required: true,
            message: {
                type: "Polozaj mora biti \"number\".",
                required: "Polozaj mora biti prisoten!"
            }
        },
        poslovalnica: {
            type: String,
            required: true,
            message: {
                type: "Poslovalnica mora biti \"string\".",
                required: "Poslovalnica mora biti prisotna! Potrebna prijava?"
            }
        },
        imeOddelka: {
            type: String,
            required: true,
            length: { min: 1, max: 20 },
            message: {
                type: "Ime oddelka mora biti \"string\".",
                required: "Ime oddelka ne sme biti prazno.",
                length: "Ime oddelka mora biti dolgo med 1 in 20 znakov."
            }
        },
        stVrsticOddelka: {
            type: Number,
            required: true,
            size: { min: 1, max: 20 },
            message: {
                type: "Število vrstic za oddelek mora biti \"Number\".",
                required: "Število vrstic za oddelek ne sme biti prazno.",
                size: "Število vrstic za oddelek mora biti med 1 in 20."
            }
        },
        prihod: {
            type: String,
            message: {
                type: "Prihod na oddelek mora biti \"string\"."
            }
        },
        odhod: {
            type: String,
            message: {
                type: "Odhod na oddelek mora biti \"string\"."
            }
        },
        specialOddelek: {
            type: String,
            message: {
                type: "Posebnost oddelka mora biti \"string\"."
            }
        }
    });
    
    return errors = oddelek1.validate(oddData);
}


module.exports.validate_oddelekAdd = validate_oddelekAdd;
module.exports.validate_oddelekUpdate = validate_oddelekUpdate;