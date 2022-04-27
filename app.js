/*
  app.js -- This creates an Express webserver with login/register/logout authentication
*/

// *********************************************************** //
//  Loading packages to support the server
// *********************************************************** //
// First we load in all of the packages we need for the server...
const createError = require("http-errors"); // to handle the server errors
const express = require("express");
const path = require("path");  // to refer to local paths
const cookieParser = require("cookie-parser"); // to handle cookies
const session = require("express-session"); // to handle sessions using cookies
const debug = require("debug")("personalapp:server"); 
const layouts = require("express-ejs-layouts");
const axios = require("axios")

// *********************************************************** //
//  Loading models
// *********************************************************** //
const Package = require("./models/Package")

// *********************************************************** //
//  Loading JSON datasets
// *********************************************************** //
// const courses = require('./public/data/courses20-21.json')


// *********************************************************** //
//  Connecting to the database
// *********************************************************** //

const mongoose = require( 'mongoose' );
const mongodb_URI = 'mongodb+srv://user:T56BeKc3PRQztEoc@cpa02.hgtxt.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'

mongoose.connect( mongodb_URI, { useNewUrlParser: true, useUnifiedTopology: true } );
// fix deprecation warnings
mongoose.set('useFindAndModify', false); 
mongoose.set('useCreateIndex', true);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {console.log("we are connected!!!")});





// *********************************************************** //
// Initializing the Express server 
// This code is run once when the app is started and it creates
// a server that respond to requests by sending responses
// *********************************************************** //
const app = express();

// Here we specify that we will be using EJS as our view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");



// this allows us to use page layout for the views 
// so we don't have to repeat the headers and footers on every page ...
// the layout is in views/layout.ejs
app.use(layouts);

// Here we process the requests so they are easy to handle
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Here we specify that static files will be in the public folder
app.use(express.static(path.join(__dirname, "public")));

// Here we enable session handling using cookies
app.use(
  session({
    secret: "zzbbyanana789sdfa8f9ds8f90ds87f8d9s789fds", // this ought to be hidden in process.env.SECRET
    resave: false,
    saveUninitialized: false
  })
);

// *********************************************************** //
//  Defining the routes the Express server will respond to
// *********************************************************** //

const fs = require('fs')

app.get("/", async (req, res, next) => {
  res.locals.failed = false
  res.render("index");
});

app.post("/search", async (req, res, next) => {
  let result = await db.collection('top_thousand').findOne({'name':req.body.query})
  if (result !== null){
    res.locals.package = result
    res.locals.score = generateRating(result)
    res.render("package_page");
  }
  else{
    res.locals.failed = true
    res.render("index")
  }
});


app.get("/lucky", async (req, res, next) => {
  let packages = await db.collection('top_thousand').find().toArray()
  let rand = Math.floor(Math.random() * (packages.length - 1))

  let chosen = packages[rand]

  res.locals.package = chosen
  res.locals.score = generateRating(chosen)
  res.render('package_page')
});


function generateRating(package){
  /*
  Important metrics:
  - Dependents
  - Abandoned
  - GH Stars
  - Maintainers / Contributors
  - Security Advisories

  Score: /100
  Point values:
  - Dependents: 30
  - Abandoned: 30
  - GH Stars: 10
  - Maintainers: 30

  - Security Advisories: -20
  */


  let points = 0
  // More dependents, more good. As long as it's over 0, you get points.
  if (package.dependents > 10){
    points += 10
  }
  if (package.dependents > 100){
    points += 10
  }
  if (package.dependents > 1000){
    points += 10
  }

  if (!package.abandoned){
    points += 30
  }

  if (package.GitHubStars > 500){
    points += 5
  }
  if (package.GitHubStars > 10000){
    points += 5
  }

  if (package.maintainers > 1){
    points += 10
  }
  if (package.maintainers > 2){
    points += 10
  }
  if (package.contributors > 1){
    points += 5
  }
  if (package.contributors > 10){
    points += 5
  }
  
  return points
}


// here we catch 404 errors and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// this processes any errors generated by the previous routes
// notice that the function has four parameters which is how Express indicates it is an error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render("error");
});


// *********************************************************** //
//  Starting up the server!
// *********************************************************** //
//Here we set the port to use between 1024 and 65535  (2^16-1)
const port = "5000";
app.set("port", port);

// and now we startup the server listening on that port
const http = require("http");
const server = http.createServer(app);

server.listen(port);

function onListening() {
  var addr = server.address();
  var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  debug("Listening on " + bind);
}

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

server.on("error", onError);

server.on("listening", onListening);

module.exports = app;
