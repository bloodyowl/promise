var klass = require("bloody-class")
var immediate = require("bloody-immediate")
var callbacks = require("./lib/callbacks")

var promise = module.exports = klass.extend({
  PENDING : 0,
  FULFILLED : 1,
  REJECTED : 2,
  DONE : 1 | 2,
  status : 0,
  _isPromise : 1,
  constructor : function(fn){
    this.callbacks = callbacks.create(this)
    if(typeof fn != "function") {
      return this
    }
    this.fn = fn
    immediate.call(fn, this)
  },
  then : function(fulfillCallback, errorCallback){
    var self = this
    var returnedPromise = promise.create()

    this.callbacks.push(
      fulfillCallback,
      1,
      returnedPromise
    )

    this.callbacks.push(
      errorCallback,
      2,
      returnedPromise
    )

    this.callbacks.update()
    return returnedPromise
  },
  fulfill : function(value){
    var self = this
    if(self.status) {
      return
    }
    self[self.status = self.FULFILLED] = value
    this.callbacks.update()
  },
  reject : function(reason){
    var self = this
    if(self.status) {
      return
    }
    self[self.status = self.REJECTED] = reason
    this.callbacks.update()
  },
  from : function(value){
    var fulfilled = promise.create()
    if(value && value._isPromise && value.then) {
      value.then(
        function(value){
          fulfilled.fulfill(value)
        },
        function(reason){
          fulfilled.reject(reason)
        }
      )
      return fulfilled
    }
    fulfilled.fulfill(value)
    return fulfilled
  },
  createRejected : function(reason){
    var rejected = promise.create()
    rejected.reject(reason)
    return rejected
  },
  all : function(array){
    var index = -1
    var length = array.length
    var results = Array(length)
    var resultsMap = Array(length)
    var returnedPromise = promise.create()

    function failAll(reason){
      returnedPromise.reject(reason)
    }

    function check(){
      var length = results.length
      while(--length > -1) {
        if(resultsMap[length] !== 1) {
          return
        }
      }
      returnedPromise.fulfill(results)
    }

    while(++index < length) {
      (function(any, index){
        promise.from(any)
          .then(
            function(value){
              results[index] = value
              resultsMap[index] = 1
              check()
            },
            failAll
          )
      })(array[index], index)
    }

    return returnedPromise
  }
})
