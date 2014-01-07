var klass = require("bloody-class")
  , immediate = require("bloody-immediate")
  , callbacks = require("./lib/callbacks")
  , _isPrototypeOf = {}.isPrototypeOf
  , _hasOwnProperty = {}.hasOwnProperty
  
var promise = module.exports = klass.extend({
  PENDING : 0,
  FULFILLED : 1,
  REJECTED : 2,
  EXECUTED : 4,
  status : 0,
  _isPromise : 1,
  constructor : function(fn){
    this.callbacks = callbacks.create(this)
    if(typeof fn != "function") return this
    this.fn = fn
    immediate.call(fn, this)
  },
  then : function(fulfillCallback, errorCallback){
    var self = this
      , returnedPromise = promise.create()
    this.callbacks.push(fulfillCallback, 1, returnedPromise)
    this.callbacks.push(errorCallback, 2, returnedPromise)
    this.callbacks.update()
    return returnedPromise
  },
  fulfill : function(value){
    var self = this
    if(self.status) return
    self[self.status = self.FULFILLED] = value
    this.callbacks.update()
  },
  reject : function(reason){
    var self = this
    if(self.status) return
    self[self.status = self.REJECTED] = reason
    this.callbacks.update()
  },
  from : function(value){
    var fulfilled = promise.create()
    if(value && value._isPromise && value.then) {
      value.then(function(value){
        fulfilled.fulfill(value)
      }, function(reason){
        fulfilled.reject(reason)
      })
      return fulfilled
    }
    fulfilled.fulfill(value)
    return fulfilled
  },
  createRejected : function(reason){
    var rejected = promise.create()
    rejected.reject(reason)
    return rejected
  }
})