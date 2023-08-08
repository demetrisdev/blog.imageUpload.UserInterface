const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const flash = require('express-flash');
const methodOverride = require('method-override');
const User = require('../models/user');
const initializePassport = require('../passport-config');
const usersRouter = express.Router();

usersRouter.use(express.urlencoded({ extended: false }));
usersRouter.use(passport.initialize());
usersRouter.use(flash());
usersRouter.use(methodOverride('_method'));

usersRouter.get('/register', (req, res) => {
  res.render('register.ejs');
});

usersRouter.post('/register', async (req, res) => {
  const { name, password } = req.body;
  try {
    const user = new User({ name, password });
    await user.save();
    setTimeout(() => {
      res.redirect('/users/login');
    }, 3500);
  } catch (err) {
    res.redirect('/users/register');
  }
});

usersRouter.get('/login', (req, res) => {
  res.render('login');
});

usersRouter.post('/login', passport.authenticate('local', {
  successRedirect: '../articles',
  failureRedirect: '/users/login',
  failureFlash: true
}));

usersRouter.post('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});


module.exports = usersRouter;
