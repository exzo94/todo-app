
let express = require("express");let app = express();
let mongodb = require("mongodb");let db
let sanitizeHTML = require("sanitize-html")
let port = process.env.PORT
if(port == null || port == "") {
  port = 3000
}
//lets express have access to the /public folder for <script src="browser.js"></script> in the html 
app.use(express.static('public'))

let C = 'mongodb+srv://todoAppUser:todoAppUser@cluster0.ktns5.mongodb.net/TodoApp?retryWrites=true&w=majority'
mongodb.connect(C, {useNewUrlParser: true, useUnifiedTopology: true}, (err, client) => {db = client.db();app.listen(port)})

//boilerplate for express to access async request data (same as below)
app.use(express.json())
// boilerplate for express to access submitted form data (body object is added to req (request) object))
app.use(express.urlencoded({extended: false}))

// get is for incoming requests
app.get('/', function(req, res) {
  // two parameters in the function err stands for displaying error and items1 would be javascript array of all items in the database
  db.collection('items').find().toArray(function(err, itemsArray) {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Simple To-Do App</title>
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS" crossorigin="anonymous">
    </head>
    <body>
      <div class="container">
        <h1 class="display-4 text-center py-1">To-Do App</h1>
        
        <div class="jumbotron p-3 shadow-sm">
          <form id="create-form" action="/create-item" method="POST">
            <div class="d-flex align-items-center">
              <input id="create-field" name="itemHTML" autofocus autocomplete="off" class="form-control mr-3" type="text" style="flex: 1;">
              <button class="btn btn-primary">Add New Item</button>
            </div>
          </form>
        </div>
        
        <ul id="item-list" class="list-group pb-5">
        </ul>
        
      </div>
      <script>
        let sendItemsToBrowser = ${JSON.stringify(itemsArray)}
      </script>
      <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
      <script src="/browser.js"></script>
    </body>
    </html>
    `)
  })
})
// post is for submit requests 
app.post('/create-item', function(req, res) {
  //name field in the html
  let safeText = sanitizeHTML(req.body.axiosText, {allowedTags: [], allowedAttributes: {}})
  db.collection('items').insertOne({text: safeText}, function(err, info) {
    // ops[0] will be first object in a collection which is text
    res.json(info.ops[0])
  })
})
// function for browser.js 
app.post('/update-item', function(req, res) {
  let safeText = sanitizeHTML(req.body.editedItem, {allowedTags: [], allowedAttributes: {}})
  db.collection('items').findOneAndUpdate({_id: new mongodb.ObjectId(req.body.editedItemId)}, {$set: {text: safeText}}, function() {
    res.send("success")
  })
})  
app.post('/delete-item', function(req, res) {
  db.collection('items').deleteOne({_id: new mongodb.ObjectId(req.body.editedItemId)}, function() {
    res.send("success")
  })
})