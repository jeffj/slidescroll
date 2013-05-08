// user schema

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , crypto = require('crypto')
  , _ = require('underscore')
  , authTypes = ['github', 'twitter', 'facebook', 'google']

var UserSchema = new Schema({
    email: String
  , username: String
  , provider: String
  , hashed_password: String
  , salt: String
  , facebook: {}
  , twitter: {}
  , github: {}
  , google: {}
  , account_standing: {type : Boolean, default : true}
  , accountPlan: {type : String, default : "free"}
  , stripe_id: {type : String, default : null}
  , is_holder: {type : Boolean, default : true}
  , resettoken: {type : Number, default : null}
  , resetexpire: {type : Date, default : Date.now}
  , createdAt  : {type : Date, default : Date.now}

})

// virtual attributes
UserSchema
  .virtual('password')
  .set(function(password) {
    this._password = password
    this.salt = this.makeSalt()
    this.hashed_password = this.encryptPassword(password)
  })
  .get(function() { return this._password })

// validations
var validatePresenceOf = function (value) {
  return value && value.length
}
// pre save hooks
UserSchema.pre('save', function(next) {
  if (!this.isNew) return next()

  if (!validatePresenceOf(this.password) && authTypes.indexOf(this.provider) === -1)
    next(new Error('Invalid password'))
  else
    next()
})

// methods
UserSchema.method('authenticate', function(plainText) {
  return this.encryptPassword(plainText) === this.hashed_password
})

UserSchema.method('makeSalt', function() {
  return Math.round((new Date().valueOf() * Math.random())) + ''
})

UserSchema.method('encryptPassword', function(password) {
  if (!password) return ''
  return crypto.createHmac('sha1', this.salt).update(password).digest('hex')
})

mongoose.model('User', UserSchema)
