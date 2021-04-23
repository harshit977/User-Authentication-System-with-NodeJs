const express= require("express");
const { loggedInPage} = require("../controllers/loggedin");
const {verifyUser} = require('../authenticate');
const router = express.Router();

router.get("/index",verifyUser,loggedInPage);

module.exports =router;
