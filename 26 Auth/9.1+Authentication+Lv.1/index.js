import express from "express";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import db from "./db.js";
import passport from "./auth.js";
import session from 'express-session';
import env from 'dotenv';

env.config();

const app = express();
const port = 3000;
const saltRounds = 10;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000*60*60*1 } // 1 hr in ms
}));

app.use(passport.initialize());

app.use(passport.session())

const localAuthMiddleware = passport.authenticate('local', {
  successRedirect: '/secrets',
  failureRedirect: '/login',
  session: true,
});

const googleAuthMiddleware = passport.authenticate('google', {
  successRedirect: '/secrets',
  failureRedirect: '/login',
  session: true,
})

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get('/auth/google',
  passport.authenticate('google', { scope:
      [ 'email', 'profile' ] }
));

app.get('/auth/google/secrets',
  googleAuthMiddleware
);

app.get("/login", (req, res) => {
  if (req.isAuthenticated()){
    return res.redirect("/secrets");
  } 
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.get("/secrets", (req, res) => {
  console.log(req.user);
  if(req.isAuthenticated()){
    console.log(req.user);
    return res.render("secrets.ejs");
  }
  else{
    res.redirect("/login");
  }
});


async function addUser(email, password){
  try{
      const hash = await bcrypt.hash(password, saltRounds);
      const results = await db.query('INSERT INTO users(email,password) VALUES($1,$2) RETURNING *;', [email, hash])
      const user = results.rows[0];
      return user;
    
  }
  catch(err){
    console.log(err)
    throw Error("User already exists");
  }

}

app.post("/register", async (req, res) => {
  try{
    const email = req.body.username;
    const password = req.body.password;
    const results = await db.query("SELECT * FROM users WHERE email=$1;",[email]);
    
    if (results.rows.length > 0){
      return res.send("User exists: Try logging in");
    }
    const user = await addUser(email, password);
    req.login(user, (err) => {
      if (err){
        console.log(err);
      }
      res.redirect("/secrets");
    })
  }
  catch(err){
    res.send("Registering error")
  }
});

app.post("/login", localAuthMiddleware, (req, res) => {
  res.redirect("/secrets");
});

app.get('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
