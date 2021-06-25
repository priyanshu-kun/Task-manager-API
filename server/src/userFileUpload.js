const express = require("express");
const { UserModel, TaskModel } = require("./DB/models");
const router = new express.Router();
const multer = require("multer");
const sharp = require("sharp");
const Authentication = require("./auth/auth")



// create avatar for that user
const avatar = multer({

    // set limit of filesize here 2MB is maximum limit (this object is only accpet limit data in bits so the 2 million bits)
    limits: {
        fileSize: 2000000
    },

    // here validate format of the file
    fileFilter(req, file, cb) {

        const regex = /\.(png|jpg|jpeg)$/

        // that function is run for error when user send invalid image format
        // originalname method contain name of the file in user computer
        if (!file.originalname.match(regex)) {
            return cb(new Error("Image must be in PNG or JPG format!"))
        }


        // if all things is going well
        cb(undefined, true)
        // cb(undefined,false)
    }
})




router.post("/avatar", Authentication, avatar.single('avatar'), async (req, res) => {

    // using sharp to modified image here I will convert all images into .png and resize the image smaller size
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();

    // "File" represent to the uploaded file and buffer is binary data
    req.user.avatar = buffer;

    await req.user.save();
    res.send();

}, (error, req, res, next) => {
    res.status(400).json({
        error: error.message
    })
})

router.delete("/avatar/remove", Authentication, async (req, res) => {

    req.user.avatar = undefined;
    await req.user.save();
    res.send();
})

// let's see
router.get("/:id/avatar",async (req,res) => {
    try {
        const user = await UserModel.findById(req.params.id);

        if(!user || !user.avatar) {
            throw new Error()
        }

        res.set("Content-type","image/png");
        res.send(user.avatar)
    }
    catch(e) {

    }
})

module.exports = router;