const express= require("express");
const { loggedInPage} = require("../controllers/loggedin");
const {verifyUser} = require('../authenticate');
const router = express.Router();

router.get("/loggedin",verifyUser,loggedInPage);

module.exports =router;
