/* Main application entry file. Please note, the order of loading is important.
 * Configuration loading and booting of controllers and custom error handlers */

var express = require('express')
  , fs = require('fs')
  , passport = require('passport')
  , device  = require('express-device')
  , https = require('https')
  , http = require('http')
  , domainVar="slidescroll.com";

// Load configurations
var env = process.env.NODE_ENV || 'development'
  , config = require('./config/config')[env]
  , auth = require('./config/middlewares/authorization')
  , mongoose = require('mongoose')

// Bootstrap db connection
mongoose.connect(config.db)

// Bootstrap models
var models_path = __dirname + '/app/models'
fs.readdirSync(models_path).forEach(function (file) {
  require(models_path+'/'+file)
})

// bootstrap passport config
require('./config/passport')(passport, config)

var app = express()

app.configure(function(){
    app.set('view engine', 'ejs');
    app.set('view options', { layout: false });
    app.set('views', __dirname + '/views');

    app.use(express.bodyParser());
    app.use(device.capture());
});

// express settings
require('./config/express')(app, config, passport)

// Bootstrap routes
require('./config/routes')(app, passport, auth)

// Start the app by listening on <port>
//var port = process.env.PORT || 3000
//app.listen(port)

// var options = {
//   key: fs.readFileSync('keys/privatekey.pem'),
//   cert: fs.readFileSync('keys/certificate.pem')
// };

var options = {
  ca:   fs.readFileSync('ssl/sub.class1.server.ca.pem'),
  key:  fs.readFileSync('ssl/ssl.key'),
  cert: fs.readFileSync('ssl/ssl.crt')
};

http.createServer(app).listen(3000);
//https.createServer(options, app).listen(443);
console.log('Express app started')

var server = http.createServer(function (request, response) {
  // response.writeHead(200, {"Content-Type": "text/plain"});
  // response.end("Hello World\n");
var path = "https://"+domainVar+request.url;
      response.writeHead(302, {'Location': path});
      response.write( "<a src="+path+">"+path+"</a>"+'<script type="text/javascript">window.location = "'+path+'"</script>'),
      response.end();

      return
});
//server.listen(80);


