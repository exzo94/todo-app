// browser javascript, <script> is in server.js
// Tell browser to send request to our server without submitting a form or visiting new url (Axios or fetch)

function itemTemplate(singleItem) {
  return `<li class="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
  <span class="item-text">${singleItem.text}</span>
  <div>
    <button data-id="${singleItem._id}" class="edit-me btn btn-secondary btn-sm mr-1">Edit</button>
    <button data-id="${singleItem._id}" class="delete-me btn btn-danger btn-sm">Delete</button>
  </div>
</li>`
}
// Initial Page Load Render
let ourHTML = sendItemsToBrowser.map(function(x) {
  return itemTemplate(x)
}).join('')
document.getElementById("item-list").insertAdjacentHTML("beforeend", ourHTML)
// add item without reload
let createField = document.getElementById("create-field")

document.getElementById("create-form").addEventListener("submit", function(e) {
  e.preventDefault()
  axios.post('/create-item', {axiosText: createField.value}).then(function(response) {
    document.getElementById("item-list").insertAdjacentHTML("beforeend", itemTemplate(response.data))
    createField.value = ""
    createField.focus()
  }).catch(function() {
    console.log("Please try again later.")
  })
})

document.addEventListener("click", function(e) {
  // Delete Feature
  if (e.target.classList.contains("delete-me")) {
    if (confirm("Do you really want to delete this item permanently?")) {
      axios.post('/delete-item', {editedItemId: e.target.getAttribute("data-id")}).then(function () {
        e.target.parentElement.parentElement.remove()
      }).catch(function() {
        console.log("Please try again later.")
      })
    }
  }
  // Update Feature
  // target = the html element that clicked on
  if(e.target.classList.contains("edit-me")) {
    let userInput = prompt("Enter Todo", e.target.parentElement.parentElement.querySelector(".item-text").innerHTML)
    // sending on the fly post request to the server using axios 
    // in axios instead of call() we use then() for promise (then(function will run after promise is complete)) and catch(function will run if axios.post runs into an error)
    if(userInput) {
      axios.post('/update-item', {editedItem: userInput, editedItemId: e.target.getAttribute("data-id")}).then(function() {
        e.target.parentElement.parentElement.querySelector(".item-text").innerHTML = userInput
      }).catch(function() {
        console.log("error")
      })
    }
  }
})