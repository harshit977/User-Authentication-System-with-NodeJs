exports.loggedInPage = (req,res) => 
{
    res.status(200).json(
        {
            "status":"success",
            "Route": "/home/index",
            "msg": `Welcome ${req.user.firstname} !!, You are successfully Authorized !! Your are on a protected route .`
        }
    );
}