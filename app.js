const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-mayank:Mayank1234@cluster0.dizmrch.mongodb.net/todolistDB");
const itemsSchema = new mongoose.Schema({
  name:String
});
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name:"Welcome to your todolist!"
});

const item2 = new Item({
  name:"Hit the + button to add a new item."
});

const item3 = new Item({
  name:"<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name:String,
  items:[itemsSchema]
})

const List = new mongoose.model("List", listSchema);
const day = date.getDate();
 
app.get("/", function(req, res) {



  Item.find({}).then(function(foundItems)
  {
    if(foundItems.length===0){
      Item.insertMany(defaultItems)
      .then(function(){
        "Successfully saved default items to DB"
      })
      .catch(function(err){
        console.log(err);
      });
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle:"Today", newListItems: foundItems});
    } 
  })
});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name:customListName}).then(function(foundList){
    if(!foundList)
    {
      const list = new List({
        name:customListName,
        items:defaultItems
      });
      list.save();
      res.redirect("/"+customListName);
    }
    else{
      res.render("list", {listTitle: customListName, newListItems: foundList.items});
    }
  })
  

})
app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name:itemName
  });
  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName})
    .then(function(foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    })
  }
  

});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName==="Today")
  {
    Item.findByIdAndDelete(checkedItemId).then(function(){
      console.log("Succesfully deleted checked item");
    })
    res.redirect("/");
  }
  else{
    List.findOneAndUpdate({name:listName}, {$pull: {items:{_id:checkedItemId}}}).then(function(foundList){
      res.redirect("/"+listName);

    })
  }


  
})

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT||3000, function() {
  console.log("Server started");
});
