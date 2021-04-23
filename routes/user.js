const express= require("express");
const { registerUser, loginUser,logoutUser,dumpUsers,verifyEmail} = require("../controllers/user");
const authenticate = require('../authenticate');
const router = express.Router();

router.post("/signup",registerUser);
router.get("/verify-email",verifyEmail);
router.post("/login",authenticate.isVerifiedUser,loginUser);             
router.get("/logout",authenticate.verifyUser,logoutUser);
router.get("/dump",authenticate.verifyUser,authenticate.verifyAdmin,dumpUsers);  //only admin can dump all users

module.exports =router;
