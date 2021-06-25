const app = require("./index.js");
const PORT = process.env.PORT || 5000;
const runCronJob = require("./cronJob");
app.listen(PORT, () => {
    console.log("Server is running on port: " + PORT);
    runCronJob()
})
