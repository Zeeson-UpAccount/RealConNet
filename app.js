const express = require("express");
const mongoose  = require("mongoose");
const passport  =  require("passport");
const bodyParser	= require('body-parser');
const User = require("./models/userModel");
const LocalStrategy   =  require("passport-local")
const passportLocalMongoose =  require("passport-local-mongoose");
const dotenv = require("dotenv");
const ejs   = require("ejs");
const flash = require("express-flash")
const session = require("express-session")
const app       = express();
dotenv.config();

mongoose.connect(process.env.DATABASEURL, {
  useUnifiedTopology: true,
  useNewUrlParser: true
  }, () => console.log("DB Connected!"));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded(
      { extended: true }
))
app.use(express.static('public'));
app.use(express.json());
// app.use(express.urlencoded({extended: false}));
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))

app.use(passport.initialize());
app.use(passport.session());

// passport.use(new LocalStrategy({
//   usernameField: 'email',
//   passwordField: 'password'
// }, User.authenticate()));
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


const PORT = process.env.PORT || 7000;

app.get("/", checkAuthenticated, (req, res) => {
  res.render("pages/index", { name: req.user.name })
})

  // Register page route
  app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render("pages/register")
  })

  // handing user sign up
  app.post("/register", checkNotAuthenticated, function(req, res){
      User.register(new User({
        name: req.body.name,
        username: req.body.username,
        admin: false
      }), req.body.password,
      function(err, user){
          if(err){
              console.log(err);
              return res.render("pages/register");
          }
            passport.authenticate("local")(req, res, function(){
                  res.redirect("/");
              });
      });

  });

app.get("/login", checkNotAuthenticated, (req, res) =>{
  res.render("pages/login")
})


app.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
}), function(req, res){

});

app.get('/admin-reg', checkAuthenticated, isAdmin, (req, res) => {
  res.render("pages/adminReg")
})

app.post('/admin-reg', checkAuthenticated, isAdmin, (req, res) =>{
    // we sav username in2 d db, not d passwrd (not gud idea to store paswrd in2 d db)
  User.register(new User({
    name: req.body.name,
    username: req.body.username,
    admin: false
  }), req.body.password,
  function(err, user){
      if(err){
          console.log(err);
          return res.render("pages/adminReg");
      }
        return res.redirect("/admin");

  })
})

app.get("/admin", checkAuthenticated, isAdmin, (req, res) => {
  console.log(req.user.admin)
  console.log("working")
  res.render("pages/admin")

})

// Logout route
app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/login")
});

// Check if user Authenticated
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect('/login')
}

function isAdmin(req, res, next) {
  if(!req.user.admin){
    return res.redirect('/')
  }
  next();
}

// Check if user Not Authenticated
function checkNotAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}

app.listen(PORT, () => {
  console.log(`Our app is running on port ${PORT}`);
});
