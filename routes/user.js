const express= require("express");
const { registerUser, loginUser,logoutUser,dumpUsers} = require("../controllers/user");
const authenticate = require('../authenticate');
const router = express.Router();

router.post("/signup",registerUser);
router.post("/login",loginUser);             
router.get("/logout",authenticate.verifyUser,logoutUser);
router.get("/dump",dumpUsers);

module.exports =router;
