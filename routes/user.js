const express= require("express");
const { registerUser, loginUser,logoutUser} = require("../controllers/user");
const authenticate = require('../authenticate');
const router = express.Router();

router.post("/signup",registerUser);
router.post("/login",loginUser);             
router.get("/logout",authenticate.verifyUser,logoutUser);

module.exports =router;
