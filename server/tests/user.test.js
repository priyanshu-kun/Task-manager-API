const request = require("supertest");
const app = require("../src/index");
const JWT = require("jsonwebtoken");
const mongoose = require("mongoose");
const { UserModel, TaskModel } = require("../src/DB/models")
const config = require("./jest.config")



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
})

// this function runs after every test function
// afterEach(async () => {

// })

test("Sould register a new user", async () => {
    const response = await request(app).post("/users/register").send({
        name: "priyanshu",
        email: "priyanshu@gmail.com",
        password: "1234556666"
    }).expect(201);

    // console.log(response.body)
    // assert user to check user is surely store in database
    const user = await UserModel.findById(response.body.User._id);
    expect(user).not.toBe(null);

    // assert user properties
    expect(response.body).toMatchObject({
        User: {
            name: "priyanshu",
            email: "priyanshu@gmail.com"
        }
    })

    expect(user.password).not.toBe("1234556666")
})

test("Should check user is login", async () => {
    const response = await request(app).post("/users/login").send({
        email: userOne.email,
        password: userOne.password
    }).expect(200);

    const user = await UserModel.findById(userOneID);
    expect(response.body.jwtUser).toBe(user.tokens[1].token)
})

test("Should check user is not login", async () => {
    await request(app).post("/users/login").send({
        email: userOne.email,
        password: "my cool identity"
    }).expect(404)
})

test("should fetch user profile", async () => {
    await request(app)
        .get("/users/me")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);
})


test("should not fetch user profile when user is not authenticated", async () => {
    await request(app)
        .get("/users/me")
        .send()
        .expect(401);
})

test("Should user is allow to delete their profile", async () => {
    await request(app)
        .delete("/users/removeme")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test("Should not allow to the user is delete their profile when user is not authenticated", async () => {
    await request(app)
        .delete("/users/removeme")
        .send()
        .expect(401)
})

test("should test image upload", async () => {
   await request(app)
        .post("/users/me/avatar")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .attach("avatar","tests/fixtures/priyanshu.jpg")
        .expect(200)
    
    const user = await UserModel.findById(userOneID);
    expect(user.avatar).toEqual(expect.any(Buffer));
})