import express from "express";


const app = express();
const port = 3000;
const toDoList = [];
function getDate() {
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const date = new Date(); // Get the current date

    const dayOfWeek = date.getDay(); // Get the day of the week as a number (0 for Sunday, 1 for Monday, etc.)
    const dayName = daysOfWeek[dayOfWeek]; // Get the corresponding day name from the array
    const monthIndex = date.getMonth(); // Get the month as a number (0 for January, 1 for February, etc.)
    const monthName = months[monthIndex];

    return `${dayName}, ${monthName} ${date.getDate()}`;
}

app.use(express.static("public"));
app.use(express.urlencoded({extended: true}));

app.get("/", (req, res) => {
    res.render("index.ejs", {date: getDate()});
});


app.post("/submit", (req, res) => {
    toDoList.push(req.body["content"]);
    res.render("index.ejs", {
        list: toDoList,
        len: toDoList.length,
        date: getDate(),
    });
})




app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})