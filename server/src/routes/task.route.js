const express = require("express");
const { UserModel, TaskModel } = require("../DB/models");
const router = new express.Router();
const Authentication = require("../auth/auth")
const runCronJob = require("../cronJob");



router.post("/", Authentication, async (req, res) => {

    const task = new TaskModel({

        // ES6 destructuring method mean(get all information of the task ex: name,description and completed of task)
        ...req.body,
        owner: req.user._id
    })

    try {
        const Task = await task.save();
        runCronJob()
        res.status(201).json(Task)
    }
    catch (e) {
        res.status(400).send(e)
    }
})






// GET - via completed or incompleted task
// GET - via limited task or skip some tasks aka(limit,skip)
// GET - via asending or decending order
router.get("/", Authentication, async (req, res) => {

    const match = {};
    const sort = {
        createdAt: 1
    };
    try {
        // fine approch
        // const task = await TaskModel.find({"owner": req.user._id});

        if (req.query.completed) {
            match.completed = req.query.completed === 'true'
        }

        if (req.query.sortBy) {
            const part = req.query.sortBy;
            sort.createdAt = part === "asc" ? 1 : -1;
        }

        await req.user.populate({
            path: "tasks",
            match,
            options: {
                limit: parseInt(req.query.limit, 10),
                skip: parseInt(req.query.skip, 10),
                sort
            }
        }).execPopulate()
        res.json(req.user.tasks)
    }
    catch (e) {
        res.status(500).send(e)
    }
})


// find a particular task by it's Id (owner: req.user._id is used for check relationship between task and user or check this is valid user or not before he access the particular task)
router.get("/:id", Authentication, async (req, res) => {
    const _id = req.params.id;
    try {
        const task = await TaskModel.findOne({ _id, owner: req.user._id })
        if (task === null) {
            res.status(404);
        }

        res.send(task);
    }
    catch (e) {
        res.status(500).send(e)
    }
})


router.get('/complete/:id', Authentication, async (req, res) => {

    try {
        // res.status(200).json({ id: req.params.id })
        const task = await TaskModel.findByIdAndUpdate(req.params.id, { completed: true });
        if (!task) {
            return res.status(400);
        }
        const tasks = await TaskModel.find({ completed: false });
        res.send(tasks);
    }
    catch (e) {
        res.status(500).send(e);
    }
})


// update task by it's id
router.patch("/:id", Authentication, async (req, res) => {
    const _id = req.params.id;
    const keys = Object.keys(req.body);
    const allowedUpdates = ["name", "description", "completed"];
    const isallowed = keys.every(key => allowedUpdates.includes(key));

    if (!isallowed) {
        return res.status(404).json({
            "error": "Invalid property!"
        })
    }

    try {
        const task = await TaskModel.findOne({ _id, "owner": req.user._id })

        if (!task) {
            return res.status(404).json({
                "error": "Task is not found to update"
            })
        }

        keys.forEach(update => task[update] = req.body[update]);
        await task.save();

        res.send(task)
    }
    catch (e) {
        res.status(500).send(e);
    }
})



// delete the task by it's ID
router.delete("/:id", Authentication, async (req, res) => {
    const _id = req.params.id;
    try {
        const task = await TaskModel.findOneAndDelete({ _id, owner: req.user._id })

        if (!task) {
            res.status(404).send({
                "error": "There is no task to delete!"
            })
        }


        res.send(task)
    }
    catch (e) {
        res.status(500).send(e);
    }
})

module.exports = router;
