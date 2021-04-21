const express= require("express");
const { registerUser, loginUser,logoutUser} = require("../controllers/user");
const router = express.Router();

router.post("/signup",registerUser);
router.post("/login",loginUser);             
router.get("/logout",logoutUser);

module.exports =router;

//TODO forgot passowrd api to be added