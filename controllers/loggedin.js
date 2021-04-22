exports.loggedInPage = (req,res) => {
    res.status(200).json({"status":"success","msg": "You are successfully Authorized !! Your are on a protected route"});
}