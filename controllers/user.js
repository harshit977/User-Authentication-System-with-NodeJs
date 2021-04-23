require("dotenv").config();
const User = require("../models/user");
const bcrypt=require('bcrypt');
var crypto=require('crypto');
const user = require("../models/user");
const algorithm = 'aes256';
const key=process.env.secretKey;
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);



exports.registerUser = async (req,res) => {

    if(!req.body.email || !req.body.password) {
        return res.status(400).json({ "msg": "Either email or password field is empty" });
    }
    await User.findOne({email: req.body.email})
    .then(async (user) => {
        if(user) 
        {   
            if(user.isVerified===false) {

                const msg = {
                    from: "harshitsharmabtp@gmail.com",
                    to: user.email,
                    subject: "Secure Auth Registration - Verify your Email",
                    text: `Hi there, Thanks for registering !!,
                        Please copy and paste the url given below to verify your account: 
                        http://${req.headers.host}/user/verify-email?token=${user.emailToken}`,
                    html: `<h1>Hi there,</h1>
                          <p>Thanks for registering !!</p>
                          <p>Please click on the link given below to verify your account:</p>
                          <a href="http://${req.headers.host}/user/verify-email?token=${user.emailToken}">Verify your account</a>`,
                  };

                  try 
                {
                    await sgMail.send(msg); //calling sendgrid to send email to the user's mail 
                    res.status(201).json({"msg": "Verification link sent again. Please check your email for verification link. !!"});
                    return;
                } 
                catch(err) {
                    res.status(500).json({error: "Something went Wrong. Try again !!",desc: err});
                    return;
                }
            }
            res.status(403).json({"msg": "Email already registered with some other account !!"});
            return;
        }

            const salt= await bcrypt.genSalt(13);
            const encryptedPassword =await bcrypt.hash(req.body.password, salt);
        
            var newUser= new User({
                email: req.body.email,
                password: encryptedPassword,
                isVerified : false,
                emailToken: crypto.randomBytes(64).toString("hex")
            });
            if (req.body.firstname)
                newUser.firstname = req.body.firstname;
            if (req.body.lastname)
                newUser.lastname = req.body.lastname;

            const msg = {
                from: "harshitsharmabtp@gmail.com",
                to: newUser.email,
                subject: "Secure Auth Registration - Verify your Email",
                text: `Hi there, Thanks for registering !!,
                    Please copy and paste the url given below to verify your account: 
                    http://${req.headers.host}/user/verify-email?token=${newUser.emailToken}`,
                html: `<h1>Hi there,</h1>
                      <p>Thanks for registering !!</p>
                      <p>Please click on the link given below to verify your account:</p>
                      <a href="http://${req.headers.host}/user/verify-email?token=${newUser.emailToken}">Verify your account</a>`,
              };
            try 
            {
                await sgMail.send(msg); //calling sendgrid to send email to the user's mail 
                await newUser.save();
                res.status(201).json({"msg": "User Registration Successfull. Please check your email for verification link. !!"});
                return;
            }
            catch(err) {
                res.status(500).json({error: "Something went Wrong !!",desc: err});
                return;
            }
            
    })
    .catch((err)=> {
        res.status(500).json({error: err});
    })

}

//email verification api
exports.verifyEmail = async (req, res) => {
    if(!req.query.token) {
        return res.status(401).json({error: "Query Token Missing !!"});
    }
    try {
      const user = await User.findOne({ emailToken: req.query.token });
      if (!user) {
        res.status(401).json({error: "Token Invalid !!, Please try registering again !!"});
        return;
      }
      user.emailToken = null;     //detroying the token so that no one else can use this link again
      user.isVerified = true;
      await user.save();
      res.status(200).json({ status: "success", "msg" : "Email Verification Successfull !!" });
    } catch (error) {
      if (error) {
        res.status(500).json({ error: "Something went Wrong !!", desc: error });
        return;
      }
    }
  };




exports.loginUser = async (req,res) => {

    if(!req.body.email || !req.body.password) 
    {
        return res.status(400).json({ "msg": "Either email or password field is empty" });
    }

    await User.findOne({email: req.body.email})
    .then(async (user)=> {
        if(user) 
        {
            await bcrypt.compare(req.body.password,user.password,async (err,same) => {
                 if(!err && same) {

                    var exp =  parseInt(Date.now())+parseInt(process.env.expire);       
                    var token=user._id+'.'+exp;
                    console.log(key);
                    const cipher=await crypto.createCipher(algorithm,toString(process.env.secretKey));
                    var encrypted=await cipher.update(token,'utf8','hex')+cipher.final('hex');
                    console.log(token);             
                     user.tokens.push({token: encrypted});
                     await user.save();
               
                     res.status(200).json({"msg" : "Logged In !!",token: encrypted});
                     return;
                 }
                 if(!err && !same) {
                    res.status(401).json({error: "Unauthorized !! Incorrect Password"});
                    return;
                 }
                 if(err) {
                    res.status(500).json({error: err});
                    return;
                 }
            })
        }
        else {
            res.status(404).json({"msg": "Email Not Found !!"});
            return;
        }
    })
    .catch((err) => {
        res.status(500).json({error: err});
    })
}

exports.logoutUser = async (req,res) => {
     if(req.user) 
     {
            try {
                var count=0;
                await req.user.tokens.map(async (token)=> {
     
                     const decipher= await crypto.createDecipher(algorithm,toString(process.env.secretKey));
                     var data=await decipher.update(token.token,'hex','utf8');
                     data+=decipher.final('utf8');
                     var exp=data.split('.')[1];
         
                     if((token.token != req.token) && (Date.now()<=exp)) {
                         //do nothing
                      }
                      else {
                          req.user.tokens.splice(count, 1);
                          count--;
                      } 
                      count++;   
                  })
                  await req.user.save();
                  return res.status(200).json({"msg": "Logged Out !!"});
             }
             catch(err) {
                 return res.status(401).json({error: "Invalid Token !!"});
              } 
        }
     else {
        return res.status(400).json({error : "You are not logged In !!"});
     }  
}

exports.dumpUsers = (req,res) => {         //dump all users except admin 
    if(!req.user) {
         res.status(401).json({error: "UnAuthorized !!"});
    }
    User.find((err, users)=> {
        if(err) {
            return res.status(404).json({error: err});
        }
        users=users.filter((user)=>{

            if(user.admin===true)
            return true;
            else
            user.remove();
            return false;
        })
        return res.status(200).json({"msg": "Dump Successfull !!"});
    })   
} 