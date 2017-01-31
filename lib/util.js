'use strict';

var util = function(options) {

  if(!(this instanceof util)) {
    return new util(options);
  }

  options = options || { statusVerbosity: 0 };

  let seed = options.seed || (Math.random() * 0x1000000000).toString(36),
      randomseed = require(`random-seed`),
      math = randomseed.create(seed);

  this.seed = seed;
  this.math = math;

  // TODO: think this through, logging is a mess
  // this is a result of using inherited logging levels
  var debugOutput = function(output, verbosity, priority) {
    if (verbosity >= priority ) {
      console.log(output); // eslint-disable-line no-console
    }
  };

  this.debugOutput = debugOutput;

  // capture statusVerbosity, and never [for scoped-functions] refer to it again
  this.debug = function(msg, level) {
    debugOutput(msg, options.statusVerbosity, level);
  };


  this.randomProperty = function(obj) {
    var result;
    var count = 0;
    for (var prop in obj)
      if (prop != `id`) {
        if (math.random() < 1/++count)
          result = obj[prop];
      }
    return result;
  };

  var pick = function(arr) {
    return arr[math(arr.length)];
  };
  this.pick = pick;

  this.pickCount = function(arr, count) {
    let poparr = [];
    for (let i = 0; i < count; i++) {
      poparr.push(pick(arr));
    }
    return poparr;
  };

  this.random = function(max){
    return (max !== undefined ? randomInRange(0,max) : math.random());
  };

  var randomInRange = function(min, max) {
    return math.intBetween(min, max);
    // return Math.floor(math.random() * (max - min)) + min;
  };

  this.randomInRange = randomInRange;

  this.coinflip = function(chance) {
    if (!chance) { chance = 0.5; }
    return (math.floatBetween(0,1) < chance);
  };

  this.pickRemove = function(arr) {
    var index = math.random(arr.length);
    return arr.splice(index,1)[0];
  };

  // http://stackoverflow.com/a/6274381/41153
  this.shuffle = function (a) {
    var j, x, i;
    for (i = a.length; i; i -= 1) {
      // TODO: change to use rand
      j = Math.floor(math.random() * i);
      x = a[i - 1];
      a[i - 1] = a[j];
      a[j] = x;
    }
  };

};

module.exports = util;
