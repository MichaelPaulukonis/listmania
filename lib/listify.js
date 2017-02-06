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
    let clean = word.trim().replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$|[()_,'"]|-+/g, '');
    // console.log(`'${word}' => '${clean}'`);
    return clean.trim();
  };

  // TODO: incorporate all of the extant strategies + descripts of same
  let textFilter = function(nlp) {

    let targetPos, filtered, descr, template;

    let matchStrategyFactory = function(tmpl) {
      return function() {
        template = tmpl;
        filtered = nlp.match(template);
        descr = `match: '${template}'`;
      };
    };

    let posStrategy = function() {
      targetPos = util.pick(['nouns', 'adjectives', 'adverbs', 'places', 'verbs', 'values', 'people']);
      filtered = nlp[targetPos]();
      descr = `pos: ${targetPos}`;
    };

    // looking at compromise tags @ https://github.com/nlp-compromise/compromise/blob/5596d9286e5228278dfcd956d5b98cf9adc0912c/src/sentence/pos/parts_of_speech.js
    let strategies = [
      posStrategy,
      matchStrategyFactory(`#Noun .? is .? #Noun`),
      matchStrategyFactory(`#Adjective+? #Noun .? (are|is) .? (#Adjective|#Noun)+`),
      matchStrategyFactory(`#Adjective? #Noun+ of #Adjective? #Noun`),
      matchStrategyFactory(`#Noun is #Noun`),
      matchStrategyFactory(`#Adverb+ #Verb+`),
      matchStrategyFactory('#Adjective #Noun . (are|is) . #Adjective #Noun'),
      matchStrategyFactory('#Noun * are #Noun+'),
      matchStrategyFactory('#Noun .? are #Noun+'),
      matchStrategyFactory(`The #Noun`),
      matchStrategyFactory(`The #Adjective #Noun`),
      matchStrategyFactory(`#Adjective #Noun`),
      matchStrategyFactory(`A #Noun`),
      matchStrategyFactory(`#Determiner #Adjective`),
      matchStrategyFactory(`(a|an) #Adjective`),
      matchStrategyFactory(`#Preposition #Determiner? #Noun+`),
      matchStrategyFactory(`#Conjunction #Determiner #Noun`),
      matchStrategyFactory(`#Noun #Modal`),
      matchStrategyFactory(`#Value #Adjective? #Noun`),
      matchStrategyFactory(`#Possessive #Noun+`),
      matchStrategyFactory(`#Noun the #Noun`),
      matchStrategyFactory(`#Adverb and #Adverb`),
      matchStrategyFactory(`#Noun #Conjunction #Noun`),
      matchStrategyFactory(`#Verb not`), // ???
      matchStrategyFactory(`not #Noun`),
      matchStrategyFactory(`#Infinitive`),
      matchStrategyFactory(`#Gerund`),
      matchStrategyFactory(`#Expression`),
      matchStrategyFactory(`#Person`),
      matchStrategyFactory(`(#Noun|#Person) #Copula #Adjective`),
      matchStrategyFactory(`(#Comparative|#Superlative) #Noun`)
    ];

    util.pick(strategies)();

    console.log(descr);

    return {
      parts: filtered,
      description: descr
    };
  };


  let getList = function(text) {

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
        // TODO: return a strategy, and a description of strategy
        strategy = textFilter(r),
        pos = strategy.parts.out(`array`) || [],
        subset = util.pickCount(pos,50).map(n => wordCleaner(textutil.cleaner(n))),
        wordbag = textutil.wordbag(subset),
        cleaned = Object.keys(wordbag).map(k => wordbag[k].word);

    return {
      list: cleaned.map(c => c.toUpperCase()).sort(),
      metadata: { name: name,
                  strategy: strategy.description
                }
    };
  };

  this.getList = getList;

  return this;

};

module.exports = Listmania;
