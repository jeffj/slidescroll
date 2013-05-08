// Article schema

var mongoose = require('mongoose')
  , Schema = mongoose.Schema

var getTags = function (tags) {
  return tags.join(',')
}

var setTags = function (tags) {
  return tags.split(',')
}

var ArticleSchema = new Schema({
    link: {type : String, default : '', trim : true}
  , url: {type : String, default : '', trim : true}
  , analytics: [{ _t:{type : Date, default : Date.now}, device: {type : String, default : '', trim : true}, ip: {type : String, default : '', trim : true} }]
  , customUrl : {type : Boolean, default : false}
  , broken: {type : Boolean, default : false}
  , imgfull: {type : Boolean, default : false}
  , imgphone: {type : Boolean, default : false}
  , imgtablet: {type : Boolean, default : false}
  , files: [{type : String, default : '', trim : true}]
  , filename: {type : String, default : '', trim : true}
  , s3bucket: {type : String, default : '', trim : true}
  , parsed:  {type : Boolean, default : false}
  , body: {type : String, default : '', trim : true}
  , user: {type : Schema.ObjectId, ref : 'User'}
  , comments: [{type : Schema.ObjectId, ref : 'Comment'}]
  , tags: {type: [], get: getTags, set: setTags}
  , emailnotification: {type : Boolean, default : false}
  , deactive:  {type : Boolean, default : false}
  , image: {
        cdnUri: String
      , files: []
    }
  , categories: []
  , createdAt  : {type : Date, default : Date.now}
})

ArticleSchema.path('link').validate(function (filename) {

      if (filename.match(".pdf")!=null)
        val= true
      else if (filename.match("/tmp/")!=null)
         val=true
      else
        val= false

      return val
      
}, 'Article link not valid. Please use a .pdf.')




mongoose.model('Article', ArticleSchema)
