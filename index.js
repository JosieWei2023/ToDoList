import express from "express";
import mongoose from "mongoose";
import _ from "lodash";

const app = express();
const port = 3000;

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

// Connect to mongoDB
mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");
// Create a schema
const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Items cannot be blank"]
    }
})
// Create a model
const Item = mongoose.model("Item", itemSchema);

// Create some default items
const item1 = new Item({
    name: "Welcome to your todolist!"
});

const item2 = new Item({
    name: "Hit the add button to add a new item."
});

const item3 = new Item({
    name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemSchema]
});

const List = mongoose.model("List", listSchema);


app.get("/", (req, res) => {
    Item.find({})
        .then((foundItems) => {
            if (foundItems.length === 0) {
                Item.insertMany(defaultItems)
                    .then(function () {
                        console.log("Successfully saved default items to todolistDB");
                    })
                    .catch((err)=>console.log(err));
                // after insert items, redirect to the else branch
                res.redirect("/");
            } else {
                res.render("index.ejs", {list: foundItems, title: getDate()})}})
        .catch((err) => console.log(err));

});

app.get("/:customListName", (req, res) => {
    const customListName = _.capitalize(req.params.customListName);
    List.findOne({name: customListName})
        .then((foundList) => {
            if (foundList) {
                // show an existing list
                res.render("index.ejs" , {list: foundList.items, title: foundList.name})
            } else {
                // create a new list
                const list = new List({
                    name: customListName,
                    items: defaultItems
                })
                list.save();
                res.redirect("/" + customListName);
            }
        })
        .catch((err) => console.log(err))
})


app.post("/submit", (req, res) => {
    const itemName = req.body.content;
    const listName = req.body.list;

    const newItem = new Item({
        name: itemName,
    });

    if (listName === getDate()) {
        newItem.save();
        res.redirect("/");
    } else {
        List.findOne({name: listName})
            .then((foundList) => {
                // push the newItem to the items array
                foundList.items.push(newItem);
                // save the updated foundlist
                foundList.save();
                res.redirect("/" + listName);
            })
    }
})

app.post("/delete", (req, res) => {
    const checkItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === getDate()) {
        Item.findOneAndDelete({_id: checkItemId})
            .then((deletedItem) => console.log(`${deletedItem.name} is deleted.`))
            .catch((err) => console.log(err))
            .finally(() => res.redirect("/"))
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkItemId}}})
            .then((foundList) => res.redirect("/" + listName))
            .catch((err) => console.log(err))
    };

});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})