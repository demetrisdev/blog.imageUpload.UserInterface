if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express')
const Article = require('./models/article')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const app = express()
const session = require('express-session');
const usersRouter = require('./routes/login')
const articleRouter = require('./routes/articles')
const passport = require('./passport-config');

app.set('view engine', 'ejs')

mongoose.connect('mongodb://localhost/bloggers', {
  useNewUrlParser: true, useUnifiedTopology: true})

mongoose.set('strictQuery', false);

app.use(session({
    secret: "mySecret",
    resave: false,
    saveUninitialized: false
}));


app.use(passport.initialize());
app.use(passport.session());  
app.use(express.urlencoded({ extended: false }))
app.use(methodOverride('_method'))

app.use(express.static('public'));

app.use('/articles', articleRouter)

app.use('/users', usersRouter)

app.get('/', async (req, res)=> {
  const articles = await Article.find().sort({ createdAt: 'desc' }).populate('user', 'name');
  res.render('index', { articles: articles })
})

app.get('/:slug', async (req, res) => {
    const article = await Article.findOne({ slug: req.params.slug }).populate('user', 'name');
    res.render('show_article.ejs', { article: article })
})

app.delete('/logout', (req, res) => {
  req.logout(function(err) {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});


app.listen(3000)