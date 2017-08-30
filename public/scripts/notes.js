//## Define a TeamNotes module
// This uses [a common pattern for creating a JavaScript module](https://toddmotto.com/mastering-the-module-pattern/) to keep these functions from interfering with other JavaScript code.
var TeamNotes = (function() {

  //## Model variables
  // Keep important data in one object, following [the model-view-controller pattern](http://blog.codinghorror.com/understanding-model-view-controller/].
  // - user: if user is logged in, { uid: unique database ID, author: name for posts }
  // - notes: the list of notes to display; each note has uid, author, text
  var model = {
    user: null,
    notes: []
  };
  
  //## setModel()
  //  Set a key-value in model. Update the page if different.
  //  If only this is used to change the model, the page should always be in synch.
  function setModel(key, value) {
    var oldValue = model[key];
    if (oldValue === undefined || oldValue !== value) {
      model[key] = value;
      updateViews();
    };
  }
  
  //## updateViews()
  // Generate the dynamic HTML elements
  function updateViews() {
    // Display the appropriate input form.
    showInputForm();
    // Display notes.
    showNotes();
  }
  
  //## showInputForm()
  // If not logged in, show the login form, otherwise show the post message form.
  function showInputForm() {
    // Use a CSS class "logged-in" on BODY to determine which input form to show. 
    // Call the jQuery [toggleClass](https://api.jquery.com/toggleClass/) function to add "logged-in" if user is defined.
    $("body").toggleClass("logged-in", model.user != null);    
  }
  
  //## showNotes()
  // Show the notes as an HTML list.
  function showNotes() {
    // Clear the current HTML list of posts using the jQuery [empty](http://api.jquery.com/empty/) function 
    $("#postings").empty();
    // Set the new HTML list of posted notes
    // - get the HTML template 'post-template' in SCRIPT element on the page
    var template = $("#post-template").html();
    // - render into HTML 
    var html = Mustache.render(template, model);
    // - insert the HTML into the HTML element 'postings'
    $("#postings").html(html);

  }
  
  //## postNote(form)
  // Send a new note to the server.
  // - form: an HTML form element
  function postNote(form) {
    // Get the text in the form's "note" field
    // TO DO: check that text is not empty
    sendNote(form.note.value);
  }
  
  //## loginUser(form)
  // Send user login info to the server
  // - form: an HTML login form 
  function loginUser(form) {
    // Send the text values in the form's "email" and "password" fields
    sendLogin(form.email.value, form.password.value);
  }
  
  //## logoutUser()
  // Send user logout  to the server
  function logoutUser() {
    sendLogout();
  }
  
  //## signUpUser(form)
  // Send email and password for new user to server
  // - form: an HTML signup form
  function signUpUser(form) {
    // Send the text values in the form's "email" and "password" fields
    sendSignUp(form.email.value, form.password.value);
  }
  
  //## addLocalNote()
  // Add a note to the local list and update display.
  // Called by change messages from the server.
  function addLocalNote(note) {
    // Use the JavaScript [unshift](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/unshift) function to add notes to the front of the array. 
    model.notes.unshift(note);
    // Then display the notes.
    showNotes();
  }
  
  //## Firebase-specific code
  
  // This holds the connection to Firebase.
  // YOU MUST REPLACE the URL here with the one for your Firebase database.
  // This should be the only thing you need to edit to run this webapp.
 // Initialize Firebase
    var config = {
        apiKey: "AIzaSyD9y9IWJ6baMhkKEZHsd470nZZVweklxB4",
        authDomain: "nysl-game-schedule-web-app.firebaseapp.com",
        databaseURL: "https://nysl-game-schedule-web-app.firebaseio.com",
        projectId: "nysl-game-schedule-web-app",
        storageBucket: "nysl-game-schedule-web-app.appspot.com",
        messagingSenderId: "1009239633275"
    };
    var app = firebase.initializeApp(config);
  
  //## sendNote()
  // Send a note with user info and text to Firebase  
  function sendNote(text) {
    // Send the data to Firebase.
    // - fbRef.child("notes") says to store the data under the notes key.
    // - .push(text) says to generate a unique subkey to label this note.
    if (model.user) {
      fbRef.child("notes").push({uid: model.user.uid, author: model.user.author, text: text});
    }
  }
  
  //## sendLogin()
  // Try to log the user into Firebase.
  function sendLogin(email, password) {
    // Send login information to Firebase.
    firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
      console.log("hat geklappt");
      if (error) {
        alert("Login Failed!", error);
        setModel("user", null);
      }
      else {showNotes();
        $("#post-form").css("display","block");
        };
    });
  }
  
  //## sendLogout()
  // Try to log the user out of Firebase.
  function sendLogout() {
    firebase.auth().signOut();
  }
  
  //## sendSignUp()
  // Send user signup data to Firebase.
  function sendSignUp(email, password) {
    // Send new user email and password to Firebase.
    firebase.auth().createUserWithEmailAndPassword(email, password).catch( function(error, userData) {
      if (error) {
        console.log(error)
      } 
      // If signup is successful, log the user in.
      else {
        console.log(userData)
        sendLogin(email, password);
      }
    });
  }
  
  //## updateUser()
  // Set model.user to the current logged in user data, if any.
  // Called whenever Firebase user authentication changes.
  function updateUser(authData) {
    // Set user based on authorization data
    // This code is just for email/password authentication. It would need extending for other providers. 
    if (authData && authData.provider == "password") {
      setModel("user", { uid: authData.uid, author: authData.password.email });
    }
    else {
      setModel("user", null);
    }
  }
  
  //## Set up listener for changes in user authorization
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    console.log(user);
    showNotes();
  } else {
    // No user is signed in.
  }
});
  
  //## Set up listener for new notes on Firebase
  // Subscribe to a query on the values under the key "notes" at Firebase.
  // Sort results by the Firebase-generated key. Those keys sort by time of creation.
  // Get just the 20 most recent notes.
  // When new child is added, call addLocalNote with the new note.
  // On startup, Firebase will call this for the 20 existing notes first. 

  var ref = firebase.database().ref("notes");
  ref.orderByKey().limitToLast(20).on("child_added", function(childSnap, prevKey) {
    addLocalNote(childSnap.val());
  });
  //## Attach event handlers to HTML form
  
  $("#login-btn").on("click", function () { loginUser(this.form); });
  $("#logout-btn").on("click", function () { logoutUser(); });
  $("#signup-btn").on("click", function () { signUpUser(this.form); });
  $("#post-btn").on("click", function () { postNote(this.form); });
  
})();
