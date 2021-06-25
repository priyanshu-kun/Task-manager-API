require("dotenv").config()
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const JWT = require("jsonwebtoken");
// console.log("RuncronJob: ", runCronJob)
// 

const MongoURI = process.env.MONGO_CLIENT || "";
//

mongoose.connect(MongoURI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true }, (err) => {
    if (err) {
        return console.log("There is some error to create connection!", err);
    }
    console.log("Connection created successfully...");
})


// schema for user
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        // email must be unique
        unique: true,
        trim: true,
        lowercase: true,
        // validate method is used for validate email
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a postive number')
            }
        }
    },
    tokens: [{
        // this Array of objects is used to store tokens
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        // It accpet buffer of binary bytes
        type: Buffer
    }
},
    {
        timestamps: true
    })


// virtual relationship between users and task models mean: here I populate all tasks of associated
// with that user but they will not store into User model database they are only relationship b/w user and task
UserSchema.virtual('tasks', {
    ref: 'task',
    localField: "_id",
    foreignField: "owner"
})


// update user object aka removeing passwod or tokens array
UserSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;
    return userObject;
}


// attaching a custom method of the instense of user model {the "methods" method is use for instenses }
UserSchema.methods.generateJsonWebToken = async function () {
    const user = this;

    // create token for new device or user
    const token = JWT.sign({ _id: user._id.toString() }, "Thisismylittlesecret");

    // concat to the token array
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token;
}

// attaching a custom method {the statics method is use for models}
// or one more thing that function is used for login. This function is find user in DB and check is user if saved or not if user is saved so that it will check password of that user if password is also match so it will validate the user
UserSchema.statics.findByCradentials = async (email, password) => {
    const getUserByEmail = await UserModel.findOne({ email });
    if (getUserByEmail) {
        const comparePassword = await bcrypt.compare(password, getUserByEmail.password);
        if (comparePassword) {
            return getUserByEmail;
        }
        else {
            throw new Error("Invalid password");
        }
    }
    else throw new Error("Invalid User");
}

// and pre method is run before document is saved in database (here I will hash password before the user is saved in database)
UserSchema.pre("save", async function (next) {
    // here I use this binding and this is point to documnt who is gonna to save
    const user = this;
    // is modified check is user update or not (it will become true 2 times when a new user going to save or user update his password)
    if (user.isModified("password")) {
        const hashedPassword = await bcrypt.hash(user.password, 8);
        user.password = hashedPassword;
    }
    next();
})


const TaskSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    // create relationship between tasks or user
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        // add user model reference in owner field to create relationship
        ref: 'user'
    },
    label: {
        type: String,
        default: undefined
    },
    priority: {
        type: String,
        default: 'p4'
    },
    room: {
        type: String,
        default: "inbox"
    },
    timer: {
        type: String,
        default: null
    },
    timerFlag: {
        type: Boolean,
        default: false

    }
}, {
    timestamps: true
})

// creating models
const UserModel = mongoose.model("user", UserSchema);
const TaskModel = mongoose.model("task", TaskSchema);




module.exports = { UserModel, TaskModel };