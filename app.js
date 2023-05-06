const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const _ = require("lodash")

const app = express()

app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(express.static("public"))

//connect to mongoDB
main().catch(err => console.log(err))
async function main() {
  await mongoose.connect('mongodb+srv://narturk:Test1234@cluster0.nwu85fw.mongodb.net/todolistDB')
}
//make the schema
const itemsSchema = {
  Name: String,
};
const Item = mongoose.model("item", itemsSchema)

const item1 = new Item({
  Name: "Study MongoDB:("
});
const item2 = new Item({
  Name: "Study JS"
});
const item3 = new Item({
  Name: "Study Python"
});

const defaultItems = [item1, item2, item3]

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema)

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

app.post("/", async function(req, res) {

  const itemName = req.body.newItem
  const listName = req.body.list

  const item = new Item({
    Name: itemName
  })

  if (listName === "Today") {
    item.save()
    res.redirect("/")
  } else {
    try {
      const foundList = await List.findOne({
        name: listName
      })
      foundList.items.push(item)
      foundList.save()
      res.redirect("/" + listName)
    } catch (error) {
      console.log(error)
    }
  }
})

app.post("/delete", async function(req, res) {
  const checkedItemId = req.body.checkbox
  const listName = req.body.listName

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId).then(function() {
        console.log("Successfully deleted item from DB.");
      })
      .catch(function(err) {
        console.log(err);
      });
    res.redirect("/")
  } else {
    try {
      const foundList = await List.findOneAndUpdate({
        name: listName
      }, {
        $pull: {
          items: {
            _id: checkedItemId
          }
        }
      })
      res.redirect("/" + listName)
    } catch (err) {
      console.log(err)
    }
  }
})

app.get("/:customListName", async function(req, res) {
  const customListName = _.capitalize(req.params.customListName)

  try {
    const foundList = await List.findOne({
      name: customListName
    })

    if (!foundList) {
      const list = new List({
        name: customListName,
        items: defaultItems
      })
      list.save()
      res.redirect("/" + customListName)
    } else {
      res.render("list", {
        listTitle: foundList.name,
        newListItems: foundList.items
      })
    }
  } catch (error) {
    console.log(error)
  }
})

app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
