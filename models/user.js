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
    admin: {
      type: Boolean,
      default: false
    },
    password: {
        type: String,
        max: 20,
        required: true
      },
    emailToken: {
        type: String
    },
    tokens:[{
        token:{
          type:String
        }
      }]
},{
  timestamps: true
});


module.exports = mongoose.model('User', UserSchema);