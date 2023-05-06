const express = require("express");
const bodyParser = require("body-parser");
//importe mongoose
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

//connect to mongoDB
main().catch(err => console.log(err));
async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/todolistDB');
}
//make the schema
const itemsSchema = {
  Name: String,
};
const Item = mongoose.model("item", itemsSchema);

const item1 = new Item({
  Name: "Study MongoDB:("
});
const item2 = new Item({
  Name: "Study JS"
});
const item3 = new Item({
  Name: "Study Python"
});

const defaultItems = [item1, item2, item3];

app.get("/", async function(req, res) {

  const foundItems = await Item.find({})
  if (foundItems.length === 0) {
    //insert the items to mongoDB
    Item.insertMany(defaultItems)
      .then(function() {
        console.log("Successfully saved default items to DB.");
      })
      .catch(function(err) {
        console.log(err);
      });
    res.redirect("/")
  } else {
    res.render("list", {
      listTitle: "Today",
      newListItems: foundItems
    });
  }
})

app.post("/", function(req, res) {

  const itemName = req.body.newItem

  const item = new Item({
    Name: itemName
  })

  item.save()

  res.redirect("/")
})

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox
  Item.findByIdAndRemove(checkedItemId).then(function() {
    console.log("Successfully deleted item from DB.");
  })
  .catch(function(err) {
    console.log(err);
  });
  res.redirect("/")
})

app.get("/work", function(req, res) {
  res.render("list", {
    listTitle: "Work List",
    newListItems: workItems
  });
});

app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
