'use strict';

var util = new require('../lib/util')(),
    textutil = require(`../lib/textutil.js`),
    fs = require('fs'),
    useful = JSON.parse(fs.readFileSync('../data/fifteen.thousand.json')),
    categories = Object.keys(useful.data);




// DONE: get one item from specified location
// DONE: get all categories (Array of strings) => categories object
// DONE: get random category
// DONE: get one item from random location
// TODO: get n items for location (random if not specified)
// TODO: get specific prepositional phrase
// TODO: get multiple items from same location

// [ 'USEFUL PHRASES: 3038',
//   'SIGNIFICANT PHRASES: 1667',
//   'FELICITOUS PHRASES: 671',
//   'IMPRESSIVE PHRASES: 462',
//   'PREPOSITIONAL PHRASES: 1103', => { of: 667, by: 89, in: 89, into: 81, to: 89, with: 88 }
//   'BUSINESS PHRASES: 370',
//   'LITERARY EXPRESSIONS: 1408',
//   'STRIKING SIMILES: 1378',
//   'CONVERSATIONAL PHRASES: 939',
//   'PUBLIC SPEAKING PHRASES: 3261',
//   'MISCELLANEOUS PHRASES: 1213' ]

// console.log(categories.map(c => `${c}: ${useful.data[c].length}`));

let randomCategory = function() {
  return util.pick(categories);
};

let onePhrase = function(category) {
  if (typeof category === 'undefined') {
    category = randomCategory();
  }
  return util.pick(useful.data[category]);
};

// TODO: this can repeat
let getPhrases = function(count, category) {
  if (typeof count === 'undefined') { count = 10; }
  if (typeof category === 'undefined') { category = randomCategory(); }
  let phrases = [];
  for (let i = 0; i < count; i++) {
    phrases.push(onePhrase(category));
  }

  return phrases;
};

let prepositions = ['of', 'by', 'in', 'into', 'to', 'with'];
let getPrepositionalPhrases = function(count, preposition) {
  if (typeof count === 'undefined') { count = 10; }
  if (typeof preposition === 'undefined') { preposition = util.pick(prepositions); }
  let phrases = [],
      matchRE = new RegExp(` ${preposition} `),
      sourcePrepPhrases = useful.data['PREPOSITIONAL PHRASES'].filter(p => p.match(matchRE));
  for (let i = 0; i < count; i++) {
    phrases.push(util.pick(sourcePrepPhrases));
  }

  return phrases;
};


// console.log(categories);

// console.log(randomCategory());

// console.log(onePhrase('LITERARY EXPRESSIONS'));

console.log(onePhrase(randomCategory()));


console.log(onePhrase());

categories.map(c => console.log(`${c}: ${onePhrase(c)}`));

// let preps = {};
// useful.data['PREPOSITIONAL PHRASES'].map(p => {
//   var prep = p.split(` `)[1];
//   if (!preps[prep]) { preps[prep] = 0; }
//   preps[prep]++;
// });

// console.log(preps);

console.log(`getPhrases(7, 'STRIKING SIMILES'): ${JSON.stringify(getPhrases(7, 'STRIKING SIMILES'),null,2)}`);

console.log(`getPhrases(): ${JSON.stringify(getPhrases(),null,2)}`);

console.log(JSON.stringify(getPrepositionalPhrases(), null, 2))
