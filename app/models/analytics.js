// comment schema

var mongoose = require('mongoose')
  , Schema = mongoose.Schema

var CommentSchema = new Schema({
    ip: {type : String, default : '', trim : true}
  , _article: {type : Schema.ObjectId, ref : 'Article'}
  , createdAt: {type : Date, default : Date.now}
  , device:  {type : String, default : '', trim : true}
  , location: {state:  {type : String, default : '', trim : true}, country: {type : String, default : '', trim : true}, city:  {type : String, default : '', trim : true}, zip: {type : String, default : '', trim : true}, lat: {type : String, default : '', trim : true}, lng: {type : String, default : '', trim : true},timeoffset: {type : String, default : '', trim : true} }
})

mongoose.model('Analytics', CommentSchema)
