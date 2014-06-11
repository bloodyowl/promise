var tape = require("tape")
var promise = require("../")

tape("promise", function(test){
  promise
    .create(function(resolve, reject){
      test.equal(typeof resolve, "function")
      test.equal(typeof reject, "function")
      test.end()
    })
})

tape("promise fn is optional", function(test){
  var rand = Math.random()
  var p = promise.create()
  p.then(function(value){
    test.equal(value, rand, "first value is passed")
    test.end()
  })
  p.resolve(rand)
})

tape("promise fn is optional (reject)", function(test){
  var rand = Math.random()
  var p = promise.create()
  p.then(
    null,
    function(value){
      test.equal(value, rand, "first value is passed")
      test.end()
    }
  )
  p.reject(rand)
})

tape("promise (then)", function(test){
  var rand = Math.random()
  promise
    .create(function(resolve, reject){
      resolve(rand)
      resolve(Math.random())
    })
    .then(function(value){
      test.equal(value, rand, "first value is passed")
      test.end()
    })
})

tape("promise (then) when resolved", function(test){
  var rand = Math.random()
  var p = promise
    .create(function(resolve, reject){
      resolve(rand)
    })
  setTimeout(function(){
    p.then(function(value){
      test.equal(value, rand, "first value is passed")
      test.end()
    })
  }, 200)
})

tape("promise (then) when rejected", function(test){
  var rand = Math.random()
  var p = promise
    .create(function(resolve, reject){
      reject(rand)
    })
  setTimeout(function(){
    p.then(
      null,
      function(value){
        test.equal(value, rand, "first value is passed")
        test.end()
      }
    )
  }, 200)
})

tape("promise (then) when errored", function(test){
  var rand = Math.random()
  var p = promise
    .create(function(resolve, reject){
      resolve(1)
    })
    .then(function(){
      throw rand
    })
  setTimeout(function(){
    p.then(
      null,
      function(reason){
        test.equal(reason, rand, "first value is passed")
        test.end()
      }
    )
  }, 200)
})

tape("promise (err)", function(test){
  var rand = Math.random()
  promise
    .create(function(resolve, reject){
      resolve(rand)
      throw "error"
    })
    .then(function(value){
      test.equal(value, rand, "first value is passed when error is thrown")
      test.end()
    })
})

tape("promise (reject)", function(test){
  var rand = Math.random()
  promise
    .create(function(resolve, reject){
      reject(rand)
    })
    .then(null, function(reason){
      test.equal(reason, rand, "reason is passed")
      test.end()
    })
})

tape("promise only execute one type of callbacks", function(test){
  test.plan(1)
  var rand = Math.random()
  promise
    .create(function(resolve, reject){
      resolve(rand)
      reject(rand)
    })
    .then(
      function(value){
        test.equal(value, rand, "one callback")
      },
      function(){
        test.fail()
      }
    )
})

tape("promise only execute one type of callbacks (reject)", function(test){
  test.plan(1)
  var rand = Math.random()
  promise
    .create(function(resolve, reject){
      reject(rand)
      resolve(rand)
    })
    .then(
      function(){
        test.fail()
      },
      function(reason){
        test.equal(reason, rand, "one callback")
      }
    )
})

tape("promise delegates state if nothing is passed", function(test){
  var rand = Math.random()
  promise
    .create(function(resolve, reject){
      resolve(rand)
    })
    .then()
    .then(function(value){
      test.equal(value, rand, "delegated")
      test.end()
    })
})

tape("promise delegates state if nothing is passed (reject)", function(test){
  var rand = Math.random()
  promise
    .create(function(resolve, reject){
      reject(rand)
    })
    .then()
    .then(
      null,
      function(reason){
        test.equal(reason, rand, "delegated")
        test.end()
      }
    )
})

tape("promise done method", function(test){
  test.plan(2)
  var rand = Math.random()
  promise
    .create(function(resolve, reject){
      reject(rand)
    })
    .done(function(value){
      test.equal(value, rand, "value passed (reject)")
    })
  promise
    .create(function(resolve, reject){
      resolve(rand)
    })
    .done(function(value){
      test.equal(value, rand, "value passed")
    })
})

tape("promise binds .then promise to return promise if returned", function(test){
  var rand = Math.random()
  promise
    .create(function(resolve, reject){
      resolve(rand)
    })
    .then(function(value){
      var p = promise.create()
      setTimeout(function(){
        p.resolve(value * 2)
      }, 50)
      return p
    })
    .then(function(value){
      test.equal(value, rand * 2, "bound")
      test.end()
    })
})

tape("promise binds .then promise to return promise state", function(test){
  var rand = Math.random()
  promise
    .create(function(resolve, reject){
      resolve(rand)
    })
    .then(function(value){
      var p = promise.create()
      setTimeout(function(){
        p.reject(value * 2)
      }, 50)
      return p
    })
    .then(null,
      function(reason){
        test.equal(reason, rand * 2, "bound")
        test.end()
      }
    )
})

tape("promise binds .then promise to return promise state (reject)", function(test){
  var rand = Math.random()
  promise
    .create(function(resolve, reject){
      reject(rand)
    })
    .then(
      null,
      function(value){
        var p = promise.create()
        setTimeout(function(){
          p.resolve(value * 2)
        }, 50)
        return p
      }
    )
    .then(
      function(value){
        test.equal(value, rand * 2, "bound")
        test.end()
      }
    )
})

tape("promise erros in .then callbacks", function(test){
  var rand = String(Math.random())
  promise
    .create(function(resolve, reject){
      resolve(1)
    })
    .then(function(value){
      throw rand
    })
    .then(
      null,
      function(reason){
        test.equal(reason, rand, "rejects if errored")
        test.end()
      }
    )
})

tape("promise erros in .then callbacks (reject)", function(test){
  var rand = String(Math.random())
  promise
    .create(function(resolve, reject){
      reject(1)
    })
    .then(
      null,
      function(value){
        throw rand
      }
    )
    .then(
      null,
      function(reason){
        test.equal(reason, rand, "rejects if errored")
        test.end()
      }
    )
})

tape("promise resolve event", function(test){
  var rand = Math.random()
  promise
    .create(function(resolve, reject){
      resolve(rand)
    })
    .on("resolve", function(value){
      test.equal(value, rand, "passed to event")
      test.end()
    })
})

tape("promise reject event", function(test){
  var rand = Math.random()
  promise
    .create(function(resolve, reject){
      reject(rand)
    })
    .on("reject", function(value){
      test.equal(value, rand, "passed to event")
      test.end()
    })
})

tape("promise done event", function(test){
  var rand = Math.random()
  promise
    .create(function(resolve, reject){
      resolve(rand)
    })
    .on("done", function(value){
      test.equal(value, rand, "passed to event")
      test.end()
    })
})

tape("promise done event (reject)", function(test){
  var rand = Math.random()
  promise
    .create(function(resolve, reject){
      reject(rand)
    })
    .on("done", function(value){
      test.equal(value, rand, "passed to event")
      test.end()
    })
})

tape("promise error event", function(test){
  var rand = String(Math.random())
  promise
    .create(function(resolve, reject){
      resolve(1)
    })
    .then(function(){
      throw rand
    })
    .on("error", function(err){
      test.equal(err, rand, "passed to event")
      test.end()
    })
})

tape("promise .catch method", function(test){
  var rand = String(Math.random())
  promise
    .create(function(resolve, reject){
      reject(rand)
    })
    ["catch"](function(reason){
      test.equal(reason, rand, "passed to event")
      test.end()
    })
})

tape("promise all", function(test){
  var rands = [
    Math.random(),
    Math.random(),
    Math.random()
  ]
  var promises = [
    promise.create(function(resolve){
      resolve(rands[0])
    }),
    promise.create(function(resolve){
      resolve(rands[1])
    }),
    promise.create(function(resolve){
      setTimeout(function(){
        resolve(rands[2])
      }, 50)
    })
  ]
  promise.all(promises)
    .then(function(values){
      test.deepEqual(values, rands)
      test.end()
    })
})

tape("promise all (reject)", function(test){
  var rands = [
    Math.random(),
    Math.random(),
    Math.random()
  ]
  var promises = [
    promise.create(function(resolve){
      resolve(rands[0])
    }),
    promise.create(function(resolve){
      resolve(rands[1])
    }),
    promise.create(function(resolve, reject){
      setTimeout(function(){
        reject(rands[2])
      }, 50)
    })
  ]
  promise.all(promises)
    .then(
      null,
      function(reason){
        test.equal(reason, rands[2])
        test.end()
      }
    )
})

tape("promise race", function(test){
  var rands = [
    Math.random(),
    Math.random(),
  ]
  var promises = [
    promise.create(function(resolve){
      resolve(rands[0])
    }),
    promise.create(function(resolve, reject){
      setTimeout(function(){
        resolve(rands[1])
      }, 50)
    })
  ]
  promise.race(promises)
    .then(
      function(value){
        test.equal(value, rands[0])
        test.end()
      }
    )
})

tape("promise race (reject)", function(test){
  var rands = [
    Math.random(),
    Math.random(),
  ]
  var promises = [
    promise.create(function(resolve, reject){
      reject(rands[0])
    }),
    promise.create(function(resolve, reject){
      setTimeout(function(){
        resolve(rands[1])
      }, 50)
    })
  ]
  promise.race(promises)
    .then(
      null,
      function(reason){
        test.equal(reason, rands[0])
        test.end()
      }
    )
})
