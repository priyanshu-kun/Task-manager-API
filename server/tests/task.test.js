const request = require("supertest");
const app = require("../src/index");
const JWT = require("jsonwebtoken");
const mongoose = require("mongoose");
const { UserModel, TaskModel } = require("../src/DB/models")
const config  = require("./jestConfign")



//create Id for test user
const userOneID = mongoose.Types.ObjectId();
console.log(userOneID)

const userOne = {
    _id: userOneID,
    name: "ultraLord",
    email: "ultralord@gmail.com",
    password: "this is my identity:D",
    tokens: [
        {
            token: JWT.sign({ _id: userOneID }, process.env.CLIENT_SECRET)
        }
    ]
}




// this function runs before every test function
beforeEach(async () => {
    // console.log("Before the registration test function !");
    await UserModel.deleteMany();
    await new UserModel(userOne).save();
    // await new UserModel(userTwo).save();
})

test("Should create new task in database",async () => {
    const response = await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: "jest",
            description: "This is jest test"
        })
        .expect(201)

        // console.log(response.body)
        const task = await TaskModel.findById(response.body._id);
        expect(task).not.toBeNull();

})