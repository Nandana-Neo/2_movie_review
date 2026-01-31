import express from "express";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import db from "./db.js";
import passport from "./auth.js";

const app = express();
const port = 3000;
const saltRounds = 10;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(passport.initialize());

const localAuthMiddleware = passport.authenticate('local', {
  successRedirect: '/secrets',
  failureRedirect: '/login',
  session: false
});


app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.get("/secrets", (req, res) => {
  // console.log("Here")
  // console.log(req.isAuthenticated());
  // if(req.isAuthenticated()){
    return res.render("secrets.ejs");
  // }
  // else{
  //   res.redirect("/login");
  // }
});


async function addUser(email, password){
  try{
    await db.connect();
    bcrypt.hash(password, saltRounds, async function(err, hash) {
      if (err){
        console.log("Cannot hash passwd:", err)
      }
      await db.query('INSERT INTO users(email,password) VALUES($1,$2) RETURNING id;', [email, hash])
    });
  }
  catch(err){
    console.log(err)
    throw Error("User already exists");
  }

}

app.post("/register", async (req, res) => {
  try{
    await db.connect();
    const email = req.body.username;
    const password = req.body.password;
    const results = await db.query("SELECT * FROM users WHERE email=$1;",[email]);
    
    if (results.rows.length > 0){
      return res.send("User exists: Try logging in");
    }
    await addUser(email, password);
    res.redirect("/login");
  }
  catch(err){
    res.send("Registering error")
  }
});

app.post("/login", localAuthMiddleware, (req, res) => {
  res.redirect("/secrets");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
