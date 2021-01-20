const Util = function (options) {
  if (!(this instanceof Util)) {
    return new Util(options)
  }

  options = options || { statusVerbosity: 0 }

  const seed = options.seed || (Math.random() * 0x1000000000).toString(36)
  const randomseed = require('random-seed')
  const math = randomseed.create(seed)

  this.seed = seed
  this.math = math

  // TODO: think this through, logging is a mess
  // this is a result of using inherited logging levels
  const debugOutput = function (output, verbosity, priority) {
    if (verbosity >= priority) {
      console.log(output) // eslint-disable-line no-console
    }
  }

  this.debugOutput = debugOutput

  // capture statusVerbosity, and never [for scoped-functions] refer to it again
  this.debug = function (msg, level) {
    debugOutput(msg, options.statusVerbosity, level)
  }

  this.randomProperty = function (obj) {
    let result
    let count = 0
    for (const prop in obj) {
      if (prop !== 'id') {
        if (math.random() < 1 / ++count) { result = obj[prop] }
      }
    }
    return result
  }

  const pick = function (arr) {
    return arr[this.random(arr.length - 1)]
  }
  this.pick = pick

  this.random = function (max) {
    return (max !== undefined ? randomInRange(0, max) : math.random())
  }

  const randomInRange = function (min, max) {
    return math.intBetween(min, max)
  }

  this.randomInRange = randomInRange

  this.coinflip = function (chance) {
    if (!chance) { chance = 0.5 }
    return (math.floatBetween(0, 1) < chance)
  }

  // return random element
  // side-effect: element is removed from array
  this.pickRemove = function (arr) {
    const index = this.random(arr.length - 1)

    const item = arr.splice(index, 1)[0]
    return item
  }

  // clone incoming so we can destructively remove
  // (to guarantee unique selections)
  this.pickCount = function (arr, count) {
    const poparr = []; let clone = arr.slice()
    for (let i = 0; i < count; i++) {
      poparr.push(this.pickRemove(clone))
      if (clone.length === 0) { clone = arr.slice() }
    }
    return poparr
  }

  // http://stackoverflow.com/a/6274381/41153
  this.shuffle = function (a) {
    let j, x, i
    for (i = a.length; i; i -= 1) {
      j = Math.floor(math.random() * i)
      x = a[i - 1]
      a[i - 1] = a[j]
      a[j] = x
    }
  }
}

module.exports = Util
