const express = require("express");
const cors = require("cors");
const app = express();



// maintenance code
// app.use((req,res,next) => {
//     res.status(503).send("The site is currently in maintenance please try again later!");
// })

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));



app.use("/users", require("./routes/user.route."));
app.use("/users/me", require("./userFileUpload"))
app.use("/tasks", require("./routes/task.route"));



module.exports = app;