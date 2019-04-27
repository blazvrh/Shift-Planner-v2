const Schema = require("validate");

// registracija
function validate_userOnRegister (userData) {
    const user = new Schema({
        username: {
            type: String,
            required: true,
            length: { min: 4, max: 20 },
            message: {
                type: "Uporabniško ime mora biti \"string\".",
                required: "Uporabniško ime ne sme biti prazno",
                length: "Uporabniško ime mora biti dolgo med 4 in 20 znakov"
            }
        },
        password: {
            type: String,
            required: true,
            length: { min: 6, max: 20 },
            message: {
                type: "Geslo mora biti \"string\".",
                required: "Geslo ne sme biti prazno",
                length: "Geslo mora biti dolgo med 4 in 20 znakov"
            }
        },
        poslovalnica: {
            type: String,
            required: true,
            length: { max: 30 },
            message: {
                type: "Ime poslovalnice mora biti \"string\".",
                required: "Ime poslovalnice ne sme biti prazno",
                length: "Ime poslovalnice mora biti dolgo med 4 in 30 znakov"
            }
        },
        previewPassword: {
            type: String,
            required: true,
            length: { min: 6, max: 30 },
            message: {
                type: "Geslo za predogled mora biti \"string\".",
                required: "Geslo za predogled ne sme biti prazno",
                length: "Geslo za predogled mora biti dolgo med 4 in 20 znakov"
            }
        },
        email: {
            type: String,
            message: {
                type: "Email mora biti \"string\"."
            }
        }
    });
   
  return errors = user.validate(userData);
}

// prijava
function validate_userOnLogin (userData) {
    const user = new Schema({
        username: {
            type: String,
            required: true,
            message: {
                type: "Uporabniško ime mora biti \"string\".",
                required: "Uporabniško ime ne sme biti prazno"
            }
        },
        password: {
            type: String,
            required: true,
            message: {
                type: "Geslo mora biti \"string\".",
                required: "Geslo ne sme biti prazno"
            }
        }
    });
    
    return errors = user.validate(userData);
}

module.exports.validate_userOnLogin = validate_userOnLogin;
module.exports.validate_userOnRegister = validate_userOnRegister;