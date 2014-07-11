var events = require("bloody-events")
var asap = require("asap")

var map = {
  1 : "resolve",
  2 : "reject",
  3 : "reject"
}
var identity = function(value){
  return value
}

var createCallback = function(current, then, fn, cb){
  return function(){
    asap(function(){
      var value
      try {
        value = fn(current.value)
      } catch(e) {
        then.reject(e)
        then.emit("error", e)
        return
      }
      if(value != null && typeof value.then == "function") {
        value.then(then.accessor("resolve"), then.accessor("reject"))
        return
      }
      if(fn === identity) {
        cb(value)
      } else {
        then.accessor("resolve")(value)
      }
    })
  }
}

var promise = events.extend({
  PENDING : 0,
  RESOLVED : 1,
  REJECTED : 2,
  ERROR : 3,
  constructor : function(fn){
    var current = this
    events.constructor.call(this)
    this.state = this.PENDING
    this.on("resolve", function(value){
      current.state = current.RESOLVED
      current.value = value
      current.emit("done", value)
    })
    this.on("reject", function(value){
      current.state = current.REJECTED
      current.value = value
      current.emit("done", value)
    })
    this.on("error", function(value){
      current.state = current.REJECTED | current.ERROR
      current.value = value
      current.emit("done", value)
    })
    if(typeof fn != "function") {
      return
    }
    asap(function(){
      try {
        fn(
          current.accessor("resolve"),
          current.accessor("reject")
        )
      } catch(e) {}
    })
  },
  destructor : function(){
    events.destructor.call(this)
  },
  resolve : function(value){
    var current = this
    if(this.state != this.PENDING) {
      return
    }
    current.value = value
    current.emit("resolve", value)
    current.emit("done", value)
  },
  reject : function(reason){
    var current = this
    if(this.state != this.PENDING) {
      return
    }
    current.value = reason
    current.emit("reject", reason)
    current.emit("done", reason)
  },
  then : function(resolveCallback, rejectCallback){
    var current = this
    var then = promise.create()
    var state = map[this.state]
    if(typeof resolveCallback != "function") {
      resolveCallback = identity
    }
    if(typeof rejectCallback != "function") {
      rejectCallback = identity
    }
    var onResolve = createCallback(
      current,
      then,
      resolveCallback,
      function(value){
        then.resolve(value)
      }
    )
    var onReject = createCallback(
      current,
      then,
      rejectCallback,
      function(value){
        then.reject(value)
      }
    )
    if(this.state) {
      asap(function(){
        if(state == "resolve") {
          onResolve()
          return
        }
        if(state == "reject") {
          onReject()
        }
      })
      return then
    }
    current.on("resolve", onResolve)
    current.on("reject", onReject)

    return then
  },
  "catch" : function(rejectCallback){
    return this.then(null, rejectCallback)
  },
  done : function(callback){
    return this.then(callback, callback)
  },
  all : function(promises){
    var index = -1
    var length = promises.length
    var values = Array(length)
    var done = Array(length)
    var then = promise.create()
    var check = function(){
      var index = -1
      while(++index < length) {
        if(done[index] != true) {
          return
        }
      }
      then.resolve(values)
    }
    var bind = function(index){
      var item = promises[index]
      item.then(
        function(value){
          values[index] = value
          done[index] = true
          check()
        },
        function(reason){
          then.reject(reason)
        }
      )
    }
    while(++index < length) {
      bind(index)
    }
    check()
    return then
  },
  race : function(promises){
    var index = -1
    var length = promises.length
    var then = promise.create()
    var item
    while(++index < length) {
      item = promises[index]
      item.then(
        function(value){
          then.resolve(value)
        },
        function(reason){
          then.reject(reason)
        }
      )
    }
    return then
  }
})

module.exports = promise
