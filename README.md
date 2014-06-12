# promise

[![browser support](https://ci.testling.com/bloodyowl/promise.png)](https://ci.testling.com/bloodyowl/promise)

## Install

```
$ npm install bloody-promise
```

## Require

```javascript
var promise = require("bloody-promise")
```

## API

### `promise.create([fn]) -> promise`

creates a new promise and immediately executes `fn` (asynchronously) with the promise as first argument.
`fn` has two function arguments, `resolve` and `reject` which set promise state.

### `promise.then([successCallback][, rejectCallback]) -> new promise`

adds callbacks to `promise` and returns a new promise based on the return values of callbacks.
If a promise is returned from the executed callback, `new promise` will be `fulfilled` or `rejected` when this promise is `fulfilled` or `rejected`.

### `promise.catch([rejectCallback]) -> new promise`

`.then(null, rejectCallback)` shorthand.

**NOTE** : ES3 environments may require to use a `["catch"]` syntax.

### `promise.done(callback) -> new promise`

`.then(callback, callback)` shorthand.

### `promise.resolve([value])`

resolves a promise with `value`

### `promise.reject([reason])`

rejects a promise with `reason`

### `promise.all(array) -> new promise`

creates a promise resolved when all `array` promises are fulfilled.

### `promise.race(array) -> new promise`

gives the returned promise the state of the first done promise in the array.

### events

events can be used using `.on(event, cb)`

- `resolve` : when the promise is resolved
- `reject` : when the promise is rejected
- `error` : when an error occured in a `.then` callback
- `done` : when the promise is resolved or rejected


## example

```javascript
var promise = require("bloody-promise")

function firstClick(){
  var click = promise.create(function(resolve){
    document.documentElement.addEventListener("click", onClick, false)
    function onClick(eventObject){
      click.resolve({
        eventObject.pageX,
        eventObject.pageY,
      })
      document.documentElement.removeEventListener("click", onClick, false)
    }
  })
  return click
}

firstClick()
  .then(function(coords){
    console.log("user click on", target)
    tracking.push(JSON.stringify(coords))
  })
  .then(function(){
    page.initEvents()
  })
```
