
var mongoose = require('mongoose')
  , Article = mongoose.model('Article')
  , Analytics = mongoose.model('Analytics')
  , http = require('http')
  , https = require('https')
  , knox = require('knox')
  , fs = require('fs')
  , _ = require('underscore')
  , s3bucket='slidescroll_img'
  , localhost= "https://slidescroll.com/"
  , fs=require('fs')
  , email = require("mailer")
  , sgusername = "sendgridUsername"
  , sgpassword = ""
  , domainVar = "slidescroll.com"


client = knox.createClient({
    key: ''
  , secret: ''
  , bucket: s3bucket
});

// New article
exports.new = function(req, res){
  res.render('articles/new', {
      title: 'New Article'
    , article: new Article({})
    ,localhost: localhost
  })
}

exports.robots = function(req, res){

  fs.readlink("../public/robots.txt", function(err, reponse){

        res.writeHead(200, {'Content-Type': 'text/csv'});
        res.write(reponse);
        res.end();

  })
  
}

exports.checkunparsed=function(req,res){
Article
      .find({parsed:false})
      .exec(function(err, response){
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(JSON.stringify(response));
        res.end();

      })

}




exports.restartoffice=function(req,res){
        link="http://localhost:8080/restartoffice"
          var request=http.get(link, function(response) {
          console.log("Got response: " + response.statusCode);
            if (response.statusCode!=200){
                      res.writeHead(200, {'Content-Type': 'text/html'});
                      res.write(JSON.stringify({"status":"failed"}));
                      res.end();
              }
              var body=""
            response.on('data', function (chunk) {body+=chunk});
            response.on('end', function() {
              console.log(body)
              res.writeHead(200, {'Content-Type': 'text/html'});
              res.write(body);
              res.end();

            })
      
          }).on('error', function(e) {

                   console.log("Got error: " + e.message);
                   res.writeHead(200, {'Content-Type': 'text/html'});
                   res.write(JSON.stringify({"status":"failed_it_is_down"}));
                   res.end();
          });
}


exports.checkparser=function(req,res){
        link="http://localhost:8080/check"
          var request=http.get(link, function(response) {
          console.log("Got response: " + response.statusCode);
            if (response.statusCode!=200){
                      res.writeHead(200, {'Content-Type': 'text/html'});
                      res.write(JSON.stringify({"status":"failed"}));
                      res.end();
              }
              var body=""
            response.on('data', function (chunk) {body+=chunk});
            response.on('end', function() {
              console.log(body)
              res.writeHead(200, {'Content-Type': 'text/html'});
              res.write(body);
              res.end();

            })
      
          }).on('error', function(e) {

                   console.log("Got error: " + e.message);
                   res.writeHead(200, {'Content-Type': 'text/html'});
                   res.write(JSON.stringify({"status":"failed_it_is_down"}));
                   res.end();
          });
}


exports.upload=function(req, res){
  
  if(req.files.image[0]){
   var pieces=req.files.image[0].filename.split(".")
   var end=pieces[pieces.length-1]
   var url="./parselocation/static."+end

  var namePieces=req.files.image[0].filename.split("/")
   var nameend=namePieces[namePieces.length-1]
   fs.rename(req.files.image[0].path, url, function(){
          redirect='/home'
        if (url)
            redirect+="?url="+url+"&filename="+nameend
        return res.redirect(redirect)
  
   })
  }
}

var accountsInfo={
  "free":{allotment:5}
  ,"basic":{allotment:35}
  ,"premium":{allotment:75}
  ,"pro":{allotment:150}
}

// Create an article
exports.create = function (req, res) {




  Article
    .find({user:req.user._id, deactive:false })
    .count()
    .exec(function(err, articleNum){


  var article = new Article(req.body)
  if (req.body.url==''){
    article.url=String(article._id)
    article.customUrl=false
  }
  else{
    article.customUrl=true
  }

  console.log(req.body)

  if (req.body.filename!=''){
    article.filename=req.body.filename
  }

      Article
      .findOne({url:article.url})
      .exec(function(err, urlCheck){
        if (err) return res.render('500')

        if (urlCheck!=null){
          res.redirect('/?error="NameTaken"')  
          return
        }

        article.user = req.user  
        name=req.body.name
        link=req.body.link
        

        if (link.match("http://"))
         getlib=http
        else if (link.match("https://"))
         getlib=https
        else if (link.match("./parselocation/"))
          getlib=null
        else{
          res.redirect('/home?error="File Type Error"') 
          return
        }


        if (getlib==null){


                if (req.files.image[0].filename!=""){
                    
                    url=req.files.image[0].path;


                   var pieces=req.files.image[0].filename.split(".")

                   var end=pieces[pieces.length-1]
                   var url="./parselocation/static."+end


                   

                   fs.rename(req.files.image[0].path, url, function(){
                       user.provider = 'local'
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

                   })
               
               }

                    article.save(function(err){
                        if (err) {
                          res.redirect('/home?error='+err.errors.link.type)  
                        }
                        else {
                          parse(link, article._id, article)
                          res.redirect('/'+article.url)
                        }
                      })
          }else
        getlib.get(link, function(response) {


         // console.log("Got response: " + res);
          if (response.statusCode==200){

            article.save(function(err){
                if (err) {
                  res.render('articles/new', {
                      title: 'New Article'
                    , article: article
                    , errors: err.errors
                    , localhost:localhost
                  })
                }
                else {
                  parse(link, article._id, article)
                  res.redirect('/'+article.url)
                }
              })
             }else {
                  res.redirect('/?error="FileFetchError"')  
            }


        }).on('error', function(e) {
          console.log("Got error: " + e.message);
          article.parsed=true
          article.broken=true  
          res.redirect('/'+article._id)
        });

  });

 })

}


var globalstated=false
function parse(url, _id, article){
    
if(url.match("https://")!=null){
  url="https://"+escape( url.split("https://")[1] )
}else if (url.match("http://")!=null) {
  url="http://"+escape( url.split("http://")[1] )
}

console.log(url)



  http.get("http://localhost:8080/?url="+url, function(res) {
 var body=""
res.on('data', function (chunk) {body+=chunk});
res.on('end', function() {
      

      var result=JSON.parse(body)

      if(result.started=true)
        setTimeout(function(){num=0,checkupload(url, _id, article, num)},10000);


});

}).on('error', function(e) {
          console.log("Got error: " + e.message);
    
    });


}

function checkupload(url,_id, article, num){


  http.get("http://localhost:8080/check/", function(res) {
 var body=""
res.on('data', function (chunk) {body+=chunk});
res.on('end', function() {
      
        console.log("check")

      var result=JSON.parse(body)
      console.log(result)
      console.log(num)

      if(result.started==true && num<30)
        setTimeout(function(){ num+=1, checkupload(url, _id, article, num)},10000);
      else if(result.started==true && num>=30){
             article.broken=true;
             article.parsed=true;
             article.save(function(err, doc) {});
             console.log("broken")
      }
      else{
        upload(url, _id, article, 'imgfull');
        upload(url, _id, article, 'imgphone');
        upload(url, _id, article, 'imgtablet');


      }

});

}).on('error', function(e) {
  console.log("Got error: " + e.message);
});



}

function upload(url, _id, article, size){
var diraddress="./parselocation/folder/"+size+'/'
article[size]=true;
fs.readdir(diraddress, function(err, dir){


          if (err) throw err;
              var files=[], j=1
            var filecount=[]
           for (var i = dir.length - 1; i >= 0; i--) {

              fileaddress=diraddress+dir[i]

              if(dir[i].match(".jpg")!=null){
                (function(fileaddress, floc, _id, filecount, article, size){
                   fs.readFile(fileaddress, function (err, data) {
                            if (err) throw err;
                          var buffer = new Buffer(data);

                                    var headers = {
                            'Content-Type': 'text/plain'
                            ,'x-amz-acl': 'public-read' 
                                };
                               client.putBuffer(buffer, _id+"/"+size+"/"+floc, headers, function(err, response){
                            
                                if (!response && response.statusCode!= 200 || err) console.log("s3 upload error") 
                                    filecount.push(floc)
                                    console.log(filecount.length)
                                    console.log(article.files.length)


                                        if (filecount.length==article.files.length)
                                         article.save(function(err, doc) {
                                            if (err) console.log("save error in s3"+err);
                                            console.log("Saved files. a total of: "+article.files.length)
                                            checkfornext();
                                          })
                         
                          });
                        })
                })(fileaddress, dir[i], _id, filecount, article, size)
                    files.push("img"+j+".jpg")
                    j+=1

              }

           }
                       article.files=files
                       article.s3bucket=s3bucket
                       article.parsed=true
                                         


})
       

  console.log(url)
  globalstated=false;

}

function checkfornext(){
  Article
    .findOne({parsed:false})
    .exec(function(err, article){
      if(article!=null){
      parse(article.link, article._id, article) 
      }  

    })
}
exports.reupload = function (req, res) {

                var url, article=req.article
                console.log(req.files.image[0])
                if (req.files.image[0].filename!=""){
                   var pieces=req.files.image[0].filename.split(".")
                   var end=pieces[pieces.length-1]
                   var url="./parselocation/static."+end
                   fs.rename(req.files.image[0].path, url, function(){


                              article.link=url
                              article.parsed=false
                              article.broken=false 

                              article.save(function(err, doc) {
                                if (err) {
                                  res.render('articles/edit', {
                                      title: 'Edit Article'
                                    , article: article
                                    , errors: err.errors
                                    , localhost:localhost
                                  })
                                }
                               else {
                                                console.log(url)
                                                 console.log(req.article._id)

                                parse(url, req.article._id, req.article)
                                res.redirect('/'+req.article.url)
                                }
                              })

                   })
               
               }

}

exports.reload = function (req, res) {
    
   if (req.article.link.match("./parselocation/")){
  res.redirect('/'+req.article.url)
  return
  }

   var article=req.article
          article.parsed=false
          article.broken=false 

          article.save(function(err, doc) {
            if (err) {
              res.render('articles/edit', {
                  title: 'Edit Article'
                , article: article
                , errors: err.errors
                , localhost:localhost
              })
            }
           else {
            parse(req.article.link, req.article._id, req.article)
            res.redirect('/'+req.article.url)
            }
          })
    // console.log(req.article._id)

    //console.log("ss")




}

exports.reloadadmin = function (req, res) {
   link=req.article.link
if (link && link.match("./parselocation/")){
  res.redirect('/'+req.article.url)
  return
}


        var article=req.article
                article.parsed=false
                article.broken=false 

                article.save(function(err, doc) {
                  if (err) {
                    res.render('articles/edit', {
                        title: 'Edit Article'
                      , article: article
                      , errors: err.errors
                      , localhost:localhost
                    })
                  }
                 else {
                  parse(req.article.link, req.article._id, req.article)
                  res.redirect('/'+req.article.url)
                  }
                })
}

// Edit an article
exports.edit = function (req, res) {
  res.render('articles/edit', {
    title: 'Edit '+req.article.title,
    article: req.article,
    localhost:localhost
  })
}


exports.updateactive = function(req, res){

  article=req.article

  Article
    .find({user:req.user._id, deactive:false })
    .count()
    .exec(function(err, articleNum){
        
    var account=accountsInfo[req.user.accountPlan]


    if (req.body.deactive!="true" && articleNum>=account.allotment){
        return res.redirect('/home?error=You have exceeded your presentation allotment. <a href="/payment">Update Your Account</a> or deactivate some presentations.');
    }else{

          redirectBody=req.body.redirect
          article = _.extend(article, req.body)

          article.save(function(err, doc) {
            if (err) {
              res.render('articles/edit', {
                  title: 'Edit Article'
                , article: article
                , errors: err.errors
                , localhost:localhost
              })
            }
           else {

              if (redirectBody)
                redirect=redirectBody;
              else
                redirect='/'+article.url;
              res.redirect(redirect)
            }
          })

    }



})

}


// Update article
exports.update = function(req, res){
  var article = req.article, q={};  
  q.url=req.body.url


  if (q.url && q.url.match(/[ \t]|\/|\?|=|&/)!=null){
          res.render('articles/edit', {
          title: 'Edit Article'
        , article: article
        , errors: [{type:'Invalid URL. None of the following are allowed: / ? = & or Spaces'}]
        , localhost:localhost
      })
      return
  }
  if (req.body.url && String(article._id)!=req.body.url)//check this each time
    article.customUrl=true;

console.log(q)
  Article
    .findOne(q)
    .exec(function(err, urlcheck){
      if (err) return res.render('500')
      if (urlcheck && String(urlcheck._id)!=String(article._id) ) {
      res.render('articles/edit', {
          title: 'Edit Article'
        , article: article
        , errors: [{type:"URL Taken"}]
        , localhost:localhost
      })
      return
      }

  console.log(req.body)

          if (req.body.link && article.link !=req.body.link)
            parse(article.url, article._id, article),article.parsed=false, console.log("new parse");

          article = _.extend(article, req.body)

          article.save(function(err, doc) {
            if (err) {
              res.render('articles/edit', {
                  title: 'Edit Article'
                , article: article
                , errors: err.errors
                , localhost:localhost
              })
            }
           else {
              if (req.body.redirect)
                redirect=req.body.redirect;
              else
                redirect='/'+article.url;
              res.redirect(redirect)
            }
          })

      })
}


// View an article
exports.show = function(req, res){

    var fullanalytic=req.param("fullanalytic")
  if(req.article.customUrl)
    var title=req.article.url
  else{
    var m=req.article.link.split(/\//)
    var title=m[m.length-1]
  }

  Analytics
    .find({_article:req.article._id})
    .exec(function(err, datas){
    
        console.log(datas)
        res.render('articles/show', {
          title: title,
          article: req.article,
          comments: req.comments,
          analytics: datas,
          localhost:localhost,
          fullanalytic:fullanalytic

        })

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

// View an article
exports.present = function(req, res){



  console.log(req.connection.remoteAddress)

    if (req.param("uniqueid"))
      var uniqueid=req.article._id+req.param("uniqueid")
    else
      var uniqueid=req.article._id
    
   if(req.article.user && req.user && String(req.user._id)==String(req.article.user._id))
    auth=true, popover=false;
   else if (req.article.url=="demo_presentation")
    auth=true, popover=true;
   else
    auth=false, popover=false;


  //pick the size
  if (req.device.type=="tablet" && req.article && req.article.imgtablet)
  var size="imgtablet"
  else if (req.device.type=="phone" && req.article && req.article.imgphone)
  var size="imgphone"
  else
  var size="imgfull"


//here we should decide to sue smaller images if need be.
 s3loc="https://s3.amazonaws.com/"
  var slides=[]
  for (var i = 0; i < req.article.files.length; i++) {
   slides.push({img:s3loc+req.article.s3bucket+"/"+req.article._id+"/"+size+"/"+req.article.files[i]})
  };

   
  if(req.article.customUrl)
    var title=req.article.url
  else{
    var m=req.article.link.split(/\//)
    var title=m[m.length-1]
  }
  if (!req.user || String(req.article.user._id)!=String(req.user._id) ){

   analytic= new Analytics({_t:new Date(),device:req.device.type, ip: req.connection.remoteAddress, _article : req.article._id } )
    if (req.article.emailnotification==true){ 
      req.article.emailnotification=false,        
      body="Your deck was viewed on a "+req.device.type+". Visit http://"+domainVar+"/"+req.article.url+"/show to get more info. We have turned off notifications for this deck."
      subject=title+" was viewed on "
      address=req.article.user.email
      from="delivery"
      emailSend(body, subject, address, from, function(){})
      }



      if(req.article.createdAt.getTime()>1361620683722){
       req.article.save()
       console.log("current enough skipper")
      }
       // analytic.save()
        if (req.connection.remoteAddress)
      ipLookup(req.connection.remoteAddress, analytic)
        else
        analytic.save()


    if (req.article.deactive){
      res.render('404', {
        title: title,
        error: "Not found",
      })
      return
    }

  }

res.render('articles/showpres', {
    title: title,
    article: req.article,
    comments: req.comments,
    slides:slides,
    auth:auth,
    _id:uniqueid,
    parsed: req.article.parsed,
    type: req.device.type,
    localhost:localhost,
    popover: popover,
    domainVar:domainVar,
  })

}


function ipLookup(ip, analytic){
      var options = {
        hostname: 'api.ipinfodb.com',
        port: 80,
        path: '/v3/ip-city/?key=bb252e9379a4ffb415090be8c52fa74ec7b6f464cc69ca071fcbb8f61d120ea6&ip='+ip,
        method: 'GET'
      };

      var req = http.request(options, function(res) {
        console.log("statusCode: ", res.statusCode);
        console.log("headers: ", res.headers);
        var data=""
        res.on('data', function(d) {
          data+=d
        });
        res.on('end', function() {


          var parts=String(data).split(";");

          if (parts[3])
          analytic.location.country=parts[3]
          if (parts[5])
          analytic.location.state=parts[5]
          if (parts[6])
          analytic.location.city=parts[6]
          if (parts[7])
          analytic.location.zip=parts[7]
          if (parts[8])
          analytic.location.lat=parts[8]
          if (parts[9])
          analytic.location.lng=parts[9]
          if (parts[10])      
          analytic.location.timeoffset=parts[10]
          analytic.save()



        });
      });
      req.end();

      req.on('error', function(e) {
         
         analytic.save()
         console.error(e);
      });



}
// Delete an article
exports.destroy = function(req, res){
  var article = req.article
  article.remove(function(err){
    req.flash('notice', 'Deleted successfully')
    res.redirect('/')
  })
}

exports.main = function(req, res){
  var errors
  if (req.param("errors"))
  errors=[],errors.push( {type:req.param("errors")} )

  if (!req.user)
  res.render('articles/main', {
    title:  "Mobile SlideDecks",
    errors: errors
  })
  else
    res.redirect("/home")
}

exports.about = function(req, res){
  var errors
  res.render('articles/about', {
    title:  "Mobile SlideDecks",
    errors: errors
  })
}


// Listing of Articles
exports.index = function(req, res){
  


  var errors
  if(req.param('error'))
    errors=[],errors.push({type: req.param('error') });


    var messages
  if(req.param('message'))
    messages=[],messages.push({type: req.param('message') });

  var perPage = 20
    , page = req.param('page') > 0 ? req.param('page') : 0
    ,autopost
    ,q={};

  if(req.param('url'))
    autopost=req.param('url')

  if(req.user)
   q.user=req.user._id
  else{
    res.redirect('/')  
    return
  }


  Article
    .find(q)
    .populate('user', 'username')
    .sort({'createdAt': -1}) // sort by date
    .limit(perPage)
    .skip(perPage * page)
    .exec(function(err, articles) {
      if (err) return res.render('500')
      Article.count(q).exec(function (err, count) {
        res.render('articles/index', {
            title: 'List of Articles'
          , articles: articles
          , page: page
          , pages: count / perPage
          , errors: errors
          , messages: messages
          , localhost: localhost
          , autopost: autopost
          , upfilename: req.param('filename')
        })
        return

      })
    })
}

exports.detaildash = function (req, res) {
      var perPage = 5
    , page = req.param('page') > 0 ? req.param('page') : 0
    , query={}
    , q
    , user = req.profile
  query={}
  query.user=req.profile._id



 Article
  .find(query)
  .sort({'createdAt': -1}) // sort by date
  .limit(perPage)
  .skip(perPage * page)
  .exec(function(err, entities){
      Article.find(query).count().exec(function (err, count) {


        res.render('dash/showdetaildash', {
            title: user.name
          , user: user
          , username: user.username
          , createdAt: user.createdAt
          , articles:entities
          , _id: user._id
          , count: count
        })


      })


})
}

exports.articledash = function (req, res) {
      var perPage = 5
    , page = req.param('page') > 0 ? req.param('page') : 0
    , query={}
    , q
    , article = req.article
    
        res.render('dash/showarticledash', {
            title: article.url
          , article: article
          , error: []
        })

}



