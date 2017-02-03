'use strict';

let Listmania = function() {

  if(!(this instanceof Listmania)) {
    return new Listmania();
  }

  let nlp = require('compromise'),
      util = new require('./util')(),
      textutil = require(`./textutil.js`);

  // word, as opposed to sentences or larger
  // so we remove punctuation, etc.
  let wordCleaner = function(word) {
    let clean = word.trim().replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/, '');
    // console.log(`'${word}' => '${clean}'`);
    return clean.trim();
  };

  let getList = function(text) {
    // TODO: implement

    // idea: parse text into POS
    // grab n of tag x

    // idea: parse text into sentences
    // grab n _short_ sentences [where short is .... ???]

    // idea: quotes from text (people speaking, with quotation marks)
    // NOTE: must be a complete sentence.
    let name = 'USER PROVIDED';

    if (typeof text === 'object') {
      name = text.source;
      text = text.text;
    }

    let r = nlp(text),
        targetPos = util.pick(['nouns', 'adjectives', 'adverbs', 'places', 'verbs', 'values', 'people']),
        pos = r[targetPos]().out('array'),
        subset = util.pickCount(pos,50).map(n => wordCleaner(textutil.cleaner(n))),
        wordbag = textutil.wordbag(subset),
        cleaned = Object.keys(wordbag).map(k => wordbag[k].word);

    return {
      list: cleaned,
      metadata: { name: name, pos: targetPos }
    };
  };

  this.getList = getList;

  return this;

};

module.exports = Listmania;
