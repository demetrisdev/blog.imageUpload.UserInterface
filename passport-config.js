const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('./models/user'); 

passport.use(new LocalStrategy({
    usernameField: 'name',
    passwordField: 'password'
}, (name, password, cb) => {
    // Find the user in the database
    User.findOne({ name }, (err, user) => {
      if (err) return cb(err);
      if (!user) return cb(null, false, { message: 'Incorrect name surname or password.' });
  
      // Compare the password with the hashed password in the database
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) return cb(err);
        if (!isMatch) return cb(null, false, { message: 'Incorrect name surname or password.' });
        return cb(null, user);
      });
    });
}));

passport.serializeUser((user, cb) => {
    cb(null, user.id);
  });
passport.deserializeUser((id, cb) => {
    User.findById(id, (err, user) => {
      cb(err, user);
    });
});

module.exports = passport;

