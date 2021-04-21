require("dotenv").config();
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    firstname: {
        type: String,
        default: ''
      },
    lastname: {
        type: String,
        default: ''
      },
    username: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        max: 20,
        required: true
      },
    email: {
        type: String,
      },
    admin: {                  //whether the user is admin or not
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('User', UserSchema);