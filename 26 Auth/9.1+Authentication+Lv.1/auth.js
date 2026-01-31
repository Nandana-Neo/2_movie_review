import passport from 'passport';
import bcrypt from 'bcrypt';
const saltRounds = 10;
import { Strategy as LocalStrategy } from 'passport-local';
import db from './db.js';

passport.use(new LocalStrategy(async function(username, password, done) {
    console.log("Authenticating user:", username);
    try{
        const results = await db.query("SELECT * FROM users WHERE email=$1;",[username]);
        if(results.rows.length == 0){
            return done(null, false, { message: "Incorrect credentials" });
        }
        const user = results.rows[0];
        bcrypt.compare(password, user.password, function(err, result) {
        if(err){
            console.log("Error unhashing:", err);
            done(err, false, { message: "Hashing error" });
        }
        else{
            if(result == true){
                done(null,user);
            }
            else{
                done(null, false, { message: "Incorrect credentials" });
            }
        }
        });
    }
    catch(err){
        console.log(err);
        done(err, false);
    }
}));

passport.serializeUser(function(user, done) {
    return done(null, {id:user.id});
});

passport.deserializeUser(function(user, done) {
    return done(null, user);
});
// access user as req.user.id and call db to get more info

export default passport;