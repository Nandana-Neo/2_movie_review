import passport from 'passport';
import bcrypt from 'bcrypt';
const saltRounds = 10;
import { Strategy as LocalStrategy } from 'passport-local';
import db from './db.js';

passport.use(new LocalStrategy(async function(username, password, done) {
    console.log("Authenticating user:", username);
    try{
        await db.connect();
        const results = await db.query("SELECT password FROM users WHERE email=$1;",[username]);
        if(results.rows.length == 0){
            return done(null, false, { message: "Incorrect credentials" });
        }

        bcrypt.compare(password, results.rows[0].password, function(err, result) {
        if(err){
            console.log("Error unhashing:", err);
            done(err, false, { message: "Hashing error" });
        }
        else{
            if(result == true){
                done(null, username);
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

export default passport;