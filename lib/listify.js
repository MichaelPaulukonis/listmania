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
    let clean = word.trim().replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$|[()_,'"]|-+/g, '').replace(/\s+/g, ' ');
    return clean.trim();
  };

  // TODO: incorporate all of the extant strategies + descripts of same
  let textFilter = function(nlp) {

    let targetPos, filtered, descr, template;

    let matchStrategyFactory = function(tmpl) {
      return function() {
        template = tmpl;
        filtered = nlp.match(template).out(`array`);
        descr = `match: '${template}'`;
      };
    };

    let posStrategy = function() {
      targetPos = util.pick(['nouns', 'adjectives', 'adverbs', 'places', 'verbs', 'values', 'people']);
      filtered = nlp[targetPos]().out(`array`);
      descr = `pos: ${targetPos}`;
    };

    // buncha voodoo code....
    let posStrategyAdj = function() {
      targetPos = util.pick(['nouns', 'places', 'people']);
      filtered = util.pickCount(nlp[targetPos]().out(`array`), 50),
      descr = `pos: ${targetPos}`;

      console.log(filtered.length);

      let corpora = require('corpora-project'),
          adjs = util.pickCount(corpora.getFile('words', 'adjs').adjs, 50),
          word = filtered[0].trim();

      filtered = filtered.map(w => util.pickRemove(adjs) + ` ${word}`);

    };

    // looking at compromise tags @ https://github.com/nlp-compromise/compromise/blob/5596d9286e5228278dfcd956d5b98cf9adc0912c/src/sentence/pos/parts_of_speech.js
    let strategies = [
      posStrategyAdj,
      posStrategyAdj,
      posStrategyAdj,
      posStrategyAdj,
      posStrategyAdj,
      posStrategyAdj,
      posStrategyAdj,
      posStrategy,
      posStrategy,
      posStrategy,
      posStrategy,
      posStrategy,
      posStrategy,
      posStrategy,
      matchStrategyFactory('#Adjective #Noun . (are|is) . #Adjective #Noun'),
      matchStrategyFactory('#Noun * are #Noun+'),
      matchStrategyFactory('#Noun .? are #Noun+'),
      matchStrategyFactory(`#Adjective #Noun`),
      matchStrategyFactory(`#Adjective+? #Noun .? (are|is) .? (#Adjective|#Noun)+`),
      matchStrategyFactory(`#Adjective? #Noun+ of #Adjective? #Noun`),
      matchStrategyFactory(`#Adverb and #Adverb`),
      matchStrategyFactory(`#Adverb+ #Verb+`),
      matchStrategyFactory(`#Conjunction #Determiner #Noun`),
      matchStrategyFactory(`#Determiner #Adjective`),
      matchStrategyFactory(`#Expression`),
      matchStrategyFactory(`#Gerund`),
      matchStrategyFactory(`#Infinitive`),
      matchStrategyFactory(`#Noun #Conjunction #Noun`),
      matchStrategyFactory(`#Noun #Modal`),
      matchStrategyFactory(`#Noun .? is .? #Noun`),
      matchStrategyFactory(`#Noun is #Noun`),
      matchStrategyFactory(`#Noun the #Noun`),
      matchStrategyFactory(`#Person`),
      matchStrategyFactory(`#Possessive #Noun+`),
      matchStrategyFactory(`#Preposition #Determiner? #Noun+`),
      matchStrategyFactory(`#Value #Adjective? #Noun`),
      matchStrategyFactory(`#Verb not`), // ???
      matchStrategyFactory(`(#Comparative|#Superlative) #Noun`),
      matchStrategyFactory(`(#Noun|#Person) #Copula #Adjective`),
      matchStrategyFactory(`(a|an) #Adjective`),
      matchStrategyFactory(`(a|an) #Noun`),
      matchStrategyFactory(`The #Adjective #Noun`),
      matchStrategyFactory(`The #Noun`),
      matchStrategyFactory(`not #Noun`)
    ];

    util.pick(strategies)();

    console.log(descr);

    return {
      parts: filtered || [],
      description: descr
    };
  };

  let caseInsensitiveSort = function(a, b) {
    a = a.toUpperCase(); // ignore upper and lowercase
    b = b.toUpperCase(); // ignore upper and lowercase
    if (a < b) {
      return -1;
    }
    if (a > b) {
      return 1;
    }

    return 0;
  };

    let lengthSort = function(a, b) {
    if (a.length < b.length) {
      return -1;
    }
    if (a.length > b.length) {
      return 1;
    }

    return 0;
  };


  let getList = function(text) {

    // idea: parse text into sentences
    // grab n _short_ sentences [where short is .... ???]

    // idea: quotes from text (people speaking, with quotation marks)
    // NOTE: must be a complete sentence.


    // https://en.wikipedia.org/wiki/List_of_lists_of_lists

    // get a noun from word source
    // get a list of adjective
    // COMBINE

    // etc.

    let name = 'USER PROVIDED';

    if (typeof text === 'object') {
      name = text.source;
      text = text.text;
    }

    let r = nlp(text),
        strategy = textFilter(r),
        pos = strategy.parts,
        // textutil throws error on empty array
        subset = ((pos.length > 0) ? util.pickCount(pos,50).map(n => wordCleaner(textutil.cleaner(n))) : []),
        wordbag = textutil.wordbag(subset),
        cleaned = Object.keys(wordbag).map(k => wordbag[k].word),
        sorter = util.pick([caseInsensitiveSort, lengthSort]),
        sorted = util.coinflip() ? cleaned : cleaned.sort(sorter);

    sorted = util.coinflip() ? sorted : sorted.map(w => w.toUpperCase());

    return {
      // TODO: sort options
      // DONE: alpha, reverse alpha, length,
      // TODO: other thngs (number of vowells???)
      list: util.coinflip() ? sorted : sorted.reverse(),
      metadata: { name: name,
                  strategy: strategy.description
                }
    };
  };

  this.getList = getList;

  return this;

};

module.exports = Listmania;
