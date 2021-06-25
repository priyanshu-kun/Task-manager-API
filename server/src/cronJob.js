const cron = require("node-cron");
const sendingMail = require("./sendingEmail");
const { UserModel, TaskModel } = require("./DB/models");
let tasks = '';

async function runCronJob() {
    try {
        tasks = await TaskModel.find({});
    }
    catch (e) {
        return console.log(e)
    }
}

async function updateUser(task) {
    try {
        await TaskModel.findOneAndUpdate({ _id: task._id }, { timerFlag: true });
        runCronJob();
    }
    catch (e) {
        return console.log(e)
    }
}

cron.schedule("* * * * * *", () => {
    if (tasks === '') return;
    tasks.map(task => {
        if (task.timer === '') {
            return console.log("Timer is not set on task!");;
        }
        if (task.timer !== new Date().toString().split(" ").splice(0, 4).join(" ")) {
            return console.log("Date doesn't match!");;
        }
        if (task.timerFlag) {
            return console.log("Task email is send already!");;
        };
        task.timerFlag = true;
        UserModel.findOne({ _id: task.owner }, (err, User) => {
            if (err) return console.log(err);
            if (User) {
                console.log("User is found!")
                updateUser(task);
                const mailUser = {
                    email: User.email,
                    name: User.name,
                    title: "From todoist",
                    body: `- This is your time to take action on your task! - - ***${task.description}***.`
                }
                sendingMail(mailUser)
            }
        })
    })
})


module.exports = runCronJob;