const express = require('express')
const Article = require('../models/article')
const router = express.Router()
const { ensureAuthenticated } = require('../auth');
const passport = require('passport');
const User = require('../models/user');
const fs = require('fs');
const path = require('path');
const multer  = require('multer')


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const extname = path.extname(file.originalname)
    cb(null, file.fieldname + '-' + uniqueSuffix + extname)
  }
})

const fileFilter = function (req, file, cb) {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true) // accept image files
  } else {
    cb(new Error('Only image files are allowed.')) // reject non-image files
  }
}

const upload = multer({ storage: storage, fileFilter: fileFilter})

router.get('/', ensureAuthenticated, async (req, res) => {
  User.findOne({ _id: req.user._id }, async function(err, user) {
    if (err) {
      console.error(err);
      return;
    }
    const query = user.isAdmin ? {} : { user: req.user._id };
    const articles = await Article.find(query).populate('user', 'name');
    if (user.isAdmin) {
    }
    res.render("articles/authors_articles", { articles: articles, name: req.user.name })
  });
});


router.get('/new', ensureAuthenticated, (req, res) => {
  res.render('articles/new', { article: new Article() })
})

router.get('/edit/:id', ensureAuthenticated, async (req, res) => {
  const article = await Article.findById(req.params.id)
  res.render('articles/edit', { article: article })
})

router.get('/:slug', ensureAuthenticated, async (req, res) => {
  const article = await Article.findOne({ slug: req.params.slug })
  if (article == null) res.redirect('/')
  res.render('articles/show', { article: article })
})

router.post('/', upload.single('uploaded_file'), async (req, res, next) => {
  req.article = new Article()
  next()
}, saveArticleAndRedirect('new'))

router.put('/:id',upload.single('uploaded_file'), async (req, res, next) => {
  req.article = await Article.findById(req.params.id)
  next()
}, saveArticleAndRedirect('edit'))


router.delete('/:id', async (req, res) => {
  const article = await Article.findById(req.params.id)
  if (article) {
    if (article.imagePath) {
      fs.unlink(`public${article.imagePath}`, err => {
        if (err) {
          console.error(err)
        }
      })
    }
    await article.remove()
  }
  res.redirect('/articles')
})


function saveArticleAndRedirect(path) {
  return async (req, res) => {
    let article = req.article
    article.title = req.body.title
    article.description = req.body.description
    article.markdown = req.body.markdown
    if (req.file) {
      if (article.imagePath) {
        fs.unlinkSync(`public${article.imagePath}`)
      }
      article.imagePath = req.file.path.replace("public", "")
    }
    article.user = req.user._id
    try {
      article = await article.save()
      res.redirect(`/articles/${article.slug}`);
    } catch (e) {
      res.render(`articles/${path}`, { article: article })
    }
  }
}

module.exports = router