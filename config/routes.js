
var mongoose = require('mongoose')
  , Article = mongoose.model('Article')
  , User = mongoose.model('User')
  , async = require('async')

module.exports = function (app, passport, auth) {
  // user routes
  var users = require('../app/controllers/users')
  app.get('/login', users.login)
  app.get('/remind', users.emailremind)
  app.post('/remind', users.emailremindsubmit)
  app.get('/remindreset', users.emailremindreset)
  app.post('/remindreset', users.emailremindresetsubmit)
  app.get('/signup', users.signup)
  app.get('/logout', users.logout)
  app.post('/users', users.create)
  app.post('/usersreg', users.createreg)
  app.post('/users/session', passport.authenticate('local', {failureRedirect: '/login', failureFlash: 'Invalid email or password.'}), users.session)
  app.get('/users/:userId', users.show)
  app.get('/users/:userId/edit', users.edit)
  app.put('/users/:userId/edit', users.editpost)
  app.get('/auth/facebook', passport.authenticate('facebook', { scope: [ 'email', 'user_about_me'], failureRedirect: '/login' }), users.signin)
  app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), users.authCallback)
  app.get('/auth/github', passport.authenticate('github', { failureRedirect: '/login' }), users.signin)
  app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), users.authCallback)
  app.get('/auth/twitter', passport.authenticate('twitter', { failureRedirect: '/login' }), users.signin)
  app.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/login' }), users.authCallback)
  app.get('/auth/google', passport.authenticate('google', { failureRedirect: '/login', scope: 'https://www.google.com/m8/feeds' }), users.signin)
  app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login', scope: 'https://www.google.com/m8/feeds' }), users.authCallback)






  app.param('userId', function (req, res, next, id) {
    //console.log(id)
    User
      .findOne({ _id : id })
      .exec(function (err, user) {
        if (err) return next(err)
        if (!user) return next(new Error('Failed to load User ' + id))
        req.profile = user
        next()
      })
  })

  //dashboard
  app.get('/_dashboard', auth.requiresLogin, auth.user.isAdmin, users.userdash)


  // article routes
  var articles = require('../app/controllers/articles')

//dash
  app.get('/:id/_articledashboard',  auth.requiresLogin, auth.user.isAdmin, articles.articledash)
  app.put('/:id/_', auth.requiresLogin, auth.user.isAdmin, articles.update)
  app.get('/:id/_edit', auth.requiresLogin, auth.user.isAdmin, articles.edit)
  app.get('/:id/_show', auth.requiresLogin, auth.user.isAdmin, articles.show)
  app.del('/:id/_', auth.requiresLogin, auth.user.isAdmin, articles.destroy)


  app.get('/', articles.main)
  app.get('/robots.txt', articles.robots)
  app.get('/home', auth.requiresLogin, articles.index)
  app.get('/about', articles.about)
  app.get('/_checkparser', auth.requiresLogin, auth.user.isAdmin, articles.checkparser)
  app.get('/_checkunparsed', auth.requiresLogin, auth.user.isAdmin, articles.checkunparsed)
  app.get('/_restartoffice', auth.requiresLogin, auth.user.isAdmin, articles.restartoffice)
  app.get('/new', auth.requiresLogin, articles.new)
  app.post('/', auth.requiresLogin, articles.create)
  app.post('/upload', auth.requiresLogin, articles.upload)
  //app.get('/:id/_articledashboard',  auth.requiresLogin, auth.user.isAdmin, articles.articledash)
  app.get('/:id/_articledashboard',  auth.requiresLogin, auth.user.isAdmin, articles.articledash)
  app.get('/:id/show', auth.requiresLogin, auth.article.hasAuthorization, articles.show)
  app.get('/:id/reload', auth.requiresLogin, auth.article.hasAuthorization, articles.reload)
  app.get('/:id/reloadadmin', auth.requiresLogin, auth.user.isAdmin, articles.reloadadmin)
  app.get('/:id', articles.present)
  app.get('/:id/edit', auth.requiresLogin, auth.article.hasAuthorization, articles.edit)
  app.put('/:id', auth.requiresLogin, auth.article.hasAuthorization, articles.update)
  app.put('/:id/updateactive', auth.requiresLogin, auth.article.hasAuthorization, articles.updateactive)
  app.del('/:id', auth.requiresLogin, auth.article.hasAuthorization, articles.destroy)
  app.post('/:id/reupload', articles.reupload)


  app.param('id', function(req, res, next, id){
    Article
      .findOne({ url : id })
      .populate('user', 'username')
      .populate('user', 'email')
      .populate('comments')
      .exec(function (err, article) {
        if (err) {res.status(404);return res.render('404',{error:"Page not Found"})}
        if (!article){res.status(404);return res.render('404',{error:"Page not Found"})}

        req.article = article

        var populateComments = function (comment, cb) {
          User
            .findOne({ _id: comment._user })
            .select('username')
            .exec(function (err, user) {
              if (err) return next(err)
              comment.user = user
              cb(null, comment)
            })
        }

        if (article.comments.length) {
          async.map(req.article.comments, populateComments, function (err, results) {
            next(err)
          })
        }
        else
          next()
      })
  })

  //dashboard

  app.get('/users/:userId/_detaildashboard',  auth.requiresLogin, auth.user.isAdmin, articles.detaildash)

  // home route
  app.get('/', articles.index)

  // comment routes
  var comments = require('../app/controllers/comments')
  app.post('/:id/comments', auth.requiresLogin, comments.create)

  // tag routes
  var tags = require('../app/controllers/tags')
  app.get('/tags/:tag', tags.index)

}
