const JWT = require("jsonwebtoken");
const { UserModel, TaskModel } = require("../DB/models")

const Authentication = async function (req, res, next) {
    try {

        // get token in request header 
        const token = req.header("Authorization").replace("Bearer ", "");
        console.log("Token**********: ", token)

        // varify token
        const decoded = JWT.verify(token, process.env.CLIENT_SECRET);
        // console.log("Docoded Token: ",decoded)

        // find token in database to check authentication if token is find in db so the user is access the protected routes if user is not login so he/she can't
        const user = await UserModel.findOne({ _id: decoded._id, 'tokens.token': token });
        // console.log("User: ",user);
        if (!user) {
            throw new Error();
        }

        // if user is login so we attach user token and the user with request object
        req.token = token;
        req.user = user;
        next();
    }
    catch (e) {
        res.status(401).send({
            "error": "please authenticate."
        })
    }
}

module.exports = Authentication;