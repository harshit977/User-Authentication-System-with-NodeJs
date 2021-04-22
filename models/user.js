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
    email: {
        type: String,
        unique: true,
        required: true
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    password: {
        type: String,
        max: 20,
        required: true
      },
    token: {               //this will store login token
        type: String,
        default: ''
      },
    expireTime: {         //token expiration time //gets set when a token is created
        type: Number,
        default: ''
      }
},{
  timestamps: { currentTime: ()=> Date.now() }
});


module.exports = mongoose.model('User', UserSchema);