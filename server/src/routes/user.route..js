require("dotenv").config();
const express = require("express");
const { UserModel, TaskModel } = require("../DB/models");
const router = new express.Router();
const Authentication = require("../auth/auth");
const sendingMail = require('../sendingEmail');
// const uploadFiles = require("./userFileUpload")



router.post("/register", async (req, res) => {

    const user = new UserModel(req.body);
    try {
        // console.log("Wait into all set block")
        const User = await user.save();

        // generate JWT of register request                                                               
        const jwtUser = await User.generateJsonWebToken();
        const mailUser = {
            email: User.email,
            name: User.name,
            title: "Welcome to todoist",
            body: "I really want to welcome in our app. I hope you will use your time effectively with our service!"
        }
        // console.log("*** mailUser ***: ", mailUser)
        sendingMail(mailUser)
        res.status(201).json({
            User,
            jwtUser
        });
    }
    catch (e) {
        console.log(e)
        res.status(400).send(e);
    }
})


router.post("/login", async (req, res) => {
    try {
        console.log("req", req.body)
        // .findByCardentials is a custom method that I will attach with mongoose schema and use it like other mongoose method like : findById or find
        const getUser = await UserModel.findByCradentials(req.body.email, req.body.password);
        // generation json web toke for user who try to login
        const jwtUser = await getUser.generateJsonWebToken();
        res.send({ getUser, jwtUser })
    }
    catch (e) {
        res.status(404).send(e);
    }
})


router.get("/me", Authentication, async (req, res) => {

    // In this route I don't want to send user all data I will send only user profile who authenticated with validation function
    res.send(req.user);
})

router.post("/logout", Authentication, async (req, res) => {
    try {

        // iterate tokens array to remove a particular token within that array
        req.user.tokens = req.user.tokens.filter((token) => {

            // if valid token found so that condition is true so that mean token is removed
            return token.token !== req.token
        })
        await req.user.save();
        res.send();
    }
    catch (e) {
        res.send(500).send(e);
    }
})


router.post("/logoutAll", Authentication, async (req, res) => {
    try {

        // log out all user for devices mean -> (I will user here JWT authentication system so that user is allowed to create account with multiple devices upper logout route only logout user on particular device that user is currently used but this route is logout him all avaliable devices)
        req.user.tokens = []
        await req.user.save();
        res.send();
    }
    catch (e) {
        res.send(500).send(e);
    }
})



router.patch("/updateMe", Authentication, async (req, res) => {

    // get keys of req.body object that user send us
    const objectKeys = Object.keys(req.body);

    // all properties that are allowed to updates
    const allowedUpdates = ["name", "email", "password", "age"];

    // check user does not send unwanted property of the request
    const isallowed = objectKeys.every(update => allowedUpdates.includes(update));

    // if user add a property that is not mention in allowedUpdates array then we send back 404 message
    if (!isallowed) {
        return res.status(404).json({
            "error": "Invalid property!"
        })
    }
    try {
        // and that is forEach way
        objectKeys.forEach(update => req.user[update] = req.body[update]);
        await req.user.save();
        res.send(user);
    }
    catch (e) {
        res.status(500).send(e);
    }
})

router.delete("/removeme", Authentication, async (req, res) => {
    try {

        // new way to remove user in dbs
        await req.user.remove();

        // remove all tasks of that user when he/she is removed
        await TaskModel.deleteMany({ owner: req.user._id });
        res.send(req.user)
    }
    catch (e) {
        res.status(500).send(e);
    }
})


module.exports = router;