var mongoose = require('mongoose')
  , User = mongoose.model('User')
  ,  _ = require('underscore')
  , fs=require('fs')
  , email = require("mailer")
  //enter you sendgrid account creds.
  , sgusername = "SGusername"
  , sgpassword = "SGpassword"
  , domainVar = "slidescroll.com"
    

exports.signin = function (req, res) {}

// auth callback
exports.authCallback = function (req, res, next) {
  res.redirect('/')
}

// login
exports.login = function (req, res) {
  res.render('users/login', {
      title: 'Login'
    , errorflash: req.flash('error')
  })
}

// sign up
exports.signup = function (req, res) {
  res.render('users/signup', {
      title: 'Sign up'
    , user: new User()
  })
}

// logout
exports.logout = function (req, res) {
  req.logout()
  res.redirect('/login')
}

// session
exports.session = function (req, res) {
  res.redirect('/')
}

// signup
exports.createreg = function (req, res) {  var user = req.user, q={};
    var user = new User(req.body)

  if (req.body.username)
    q.username=req.body.username
  if (req.body.email)
    q.email=req.body.email
 
  if (req.body.password)
      user.password=req.body.password


  User
    .findOne(q)
    .exec(function(err, matcher){

            if(matcher && req.body.email && matcher.email==req.body.email && matcher._id!=user._id)

                return  res.redirect("/?errors=Email Taken")

        else if(matcher && req.body.username && matcher.username==req.body.username && matcher._id!=user._id)
                return  res.redirect("/?errors=Username Taken")


          else{
           
                user.password="fake"+String(Math.random()*1000000000000000000)
                
                if (req.body.email=="")
                  user.email="@@fake"+String(Math.random()*1000000000000000000)
                else
                  user.email=req.body.email;
                //var user = new User(req.body)

                user.is_holder=false;

                user.provider = 'local'
                user.save(function (err) {
                  if (err) {
                    return res.redirect("/?errors="+escaped(err.errors))
                    //res.render('users/signup', { errors: err.errors, user: user })
                  }
                  req.logIn(user, function(err) {
                    if (err) return next(err)

                      body="Your New Account at SlideScroll hase been created"
                      subject="Welcome To SlideScroll"
                      address=user.email
                      from="delivery"
                      emailSend(body, subject, address, from)
                      redirect='/home'
                      if (req.body.url)
                        redirect+="?url="+req.body.url
                    return res.redirect(redirect)
                  })
                })

          }


    
    })



    }

function emailSend(body, subject, address, from, callback){
              email.send({
                        host: "smtp.sendgrid.net",
                        port: "587",
                        domain: domainVar,
                        to: address,
                        from: from+"@"+domainVar,
                        subject: subject,
                        body: body,
                        authentication: "login",
                        username: sgusername,
                        password: sgpassword
                    }, function(err, result){  


                        if (callback)
                          callback();
                      

                  });
            }

// signup
exports.create = function (req, res) {  var user = req.user, q={};
    if(!linkcheck(req.body.url) ) {
        res.redirect("/?errors=Not a valid URL. Try a link to a .ppt or .pptx. file.")
        return 
    }

    if(!req.body.email ) {
        res.redirect("/?errors=Please enter an email address")
        return 
    }




  var user = new User(req.body)


  if (req.body.username)
    q.username=req.body.username
  if (req.body.email)
    q.email=req.body.email
 
  if (req.body.password)
      user.password=req.body.password



  User
    .findOne(q)
    .exec(function(err, matcher){
        if(matcher && req.body.email && matcher.email==req.body.email && matcher._id!=user._id)
                return  res.redirect("/?errors=Email Taken")
                 


        else if(matcher && req.body.username && matcher.username==req.body.username && matcher._id!=user._id)

                return    res.redirect("/?errors=Username Taken")
                    

          else{
           
                user.password="fake"+String(Math.random()*100000000000000000)
                
                if (req.body.email=="")
                  user.email="@@fake"+String(Math.random()*100000000000000000)
                else
                  user.email=req.body.email, user.is_holder=false;

                var url
                console.log(req.files.image[0])
                if (req.files.image[0].filename!=""){
                    
                   var pieces=req.files.image[0].filename.split(".")
                   var end=pieces[pieces.length-1]
                   var url="./parselocation/"+req.files.image[0].filename


                   fs.rename(req.files.image[0].path, url, function(){
                       user.provider = 'local'
                       user.save(function (err) {
                        if (err) {
                          return res.render('users/signup', { errors: err.errors, user: user })
                        }
                        req.logIn(user, function(err) {
                        
                          body="Your New Account at SlideScroll hase been created"
                          subject="Welcome To SlideScroll"
                          address=user.email
                          from="delivery"
                          emailSend(body, subject, address, from)

                          if (err) return next(err)
                            redirect='/home'
                            if (url)
                              redirect+="?url="+escape(url)
                          return res.redirect(redirect)
                        })
                      })

                   })
               
               }else{
                
                      url=req.body.url;
                                        //var user = new User(req.body)
                      
                      user.save(function (err) {
                        if (err) {
                          return res.render('users/signup', { errors: err.errors, user: user })
                        }
                        req.logIn(user, function(err) {
                          if (err) return next(err)
                            redirect='/home'
                            if (url)
                              redirect+="?url="+url
                          return res.redirect(redirect)
                        })
                      })

                }
                

          }





    })

}

function linkcheck(filename){
    var val
      if (!filename)
        val=false
      else if (filename.match(".ppt")!=null)
        val= true
      else if (filename.match(".pptx")!=null)
        val= true
      else if (filename.match(".pps")!=null)
        val= true
      else
        val= false
      return val
}

exports.emailremind=function(req, res){
   
          res.render('users/remind', {
           title: 'Password Remind'
        })

}

exports.emailremindsubmit=function(req, res){

    q={}
    q.email=req.body.email
    User
    .findOne(q)
    .exec(function(err, user){
        if (user==null){
         res.render('users/remind', {
                    title: 'Password Reset'
                  , user:  user
                  , errors: [{type:"Email Not found."}]
                })
         return
        }
        user.resettoken= Math.random()*100000000000000000
        user.resetexpire= new Date() 

        body="Click here to reset your password https://"+domainVar+"/remindreset?token="+user.resettoken
        subject= "Reset Your SlideScroll Password"
        address=user.email
        from="delivery"
        emailSend(body, subject, address, from, function(){

            user.save(function (err) {
                   res.render('users/remind', {
                    title: 'Password Reset'
                  , user:  user
                  , message: [{type:"Check Your Email for Token"}]
                })
            })
        })
    })

}


exports.emailremindreset=function(req, res){

        token=req.param("token")
        res.render('users/remindreset', {
           title: 'Password Reset'
           , token: token
        })
}

//data protype for adding
Date.prototype.addHours= function(h){
    this.setHours(this.getHours()+h);
    return this;
}


exports.emailremindresetsubmit=function(req, res){
    q={}
    q.resettoken=req.body.resettoken


    User
    .findOne(q)
    .exec(function(err, user){

                  console.log(user)

            if (user!=null && q.resettoken==user.resettoken && user.resetexpire.addHours(1)>new Date() )
              user.resettoken=null,
              user.password=req.body.password,
              user.save(function (err) {

                   res.render('users/remindreset', {
                    title: 'Password Reset'
                  , message: [{type:"Password Reset"}]
                })

            })
            else
              res.render('users/remindreset', {
                    title: 'Password Reset'
                  , errors: [{type:"Invalid Reset Link"}]
                })

    })

    

}



// edit
exports.edit = function (req, res) {
  res.render('users/update', {
      title: 'Edit Account'
    , user: req.user
  })
}

exports.editpost=function(req, res){

  var user = req.user, q={};

  if (req.body.username)
    q.username=req.body.username
  if (req.body.email)
    q.email=req.body.email
 
  if (req.body.password)
      user.password=req.body.password

  user.is_holder=false


  User
    .findOne(q)
    .exec(function(err, matcher){
        if(matcher && matcher.email==req.body.email && String(matcher._id)!=String(user._id))
                   res.render('users/update', {
                    title: 'Edit Account'
                  , user:  user
                  , errors: [{type:"Email Taken"}]
                })

        else if(matcher && matcher.username==req.body.username && String(matcher._id) !=String(user._id) )

                   res.render('users/update', {
                    title: 'Edit Account'
                  , user:  user
                  , errors: [{type:"Username Taken"}]
                })
          else{
            user = _.extend(user, req.body)
            console.log(req.body)
            user.save(function (err) {

              res.redirect('/home?message=Update Successful.');

            })


          }


    })



}

// show profile
exports.show = function (req, res) {
  var user = req.profile
  res.render('users/show', {
      title: user.name
    , user: user
  })
}

//dashboard
exports.userdash = function(req, res){
    var perPage = 5
    , page = req.param('page') > 0 ? req.param('page') : 0
    , query={}
    , q

    if(req.query.q) q=new RegExp(req.query.q,"i"),
    query={$or:[ {username:q },{email:q }  ] };

    if (req.param('account'))
    query.accountPlan=req.param('account')
  User
  .find(query)
  .populate("group")
  .sort({'createdAt': -1}) // sort by date
  .limit(perPage)
  .skip(perPage * page)
  .exec(function(err, users){
        if (err) return res.render('500')
        User.find(query).count().exec(function (err, count) {
        res.render('dash/showuserdash', {
        title: 'Users'
      , users: users
      , redirect: req.query.redirect
       , group: req.group
       ,auth:true
      , page: page
      , pages: count / perPage
      , count:count
      , accountPlan: req.param('account')
    })
    })

  })

}


