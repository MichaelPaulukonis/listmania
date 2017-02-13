'use strict';

let Listmania = function() {

  if(!(this instanceof Listmania)) {
    return new Listmania();
  }

  let nlp = require('compromise'),
      util = new require('./util')(),
      textutil = require(`./textutil.js`),
      corpora = require('corpora-project');

  // word, as opposed to sentences or larger
  // so we remove punctuation, etc.
  let wordCleaner = function(word) {
    // single-apostrophes left for now (posessive and contractions)
    // need a better algorithm....
    let clean = word.trim().replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$|[()_,"]|-+/g, '').replace(/\s+/g, ' ');
    return clean.trim();
  };

  // TODO: incorporate all of the extant strategies + descripts of same
  let textFilter = function(text) {

    let targetPos, filtered, descr, template;

    let matchStrategyFactory = function(tmpl) {
      return function() {
        let n = nlp(text);
        template = tmpl;
        filtered = n.match(template).out(`array`);
        descr = `match: '${template}'`;
      };
    };

    let posStrategy = function() {
      let n = nlp(text);
      targetPos = util.pick(['nouns', 'adjectives', 'adverbs', 'places', 'verbs', 'values', 'people']);
      filtered = n[targetPos]().out(`array`);
      descr = `pos: ${targetPos}`;
    };

    // buncha voodoo code....
    let posStrategyAdj = function() {
      let n = nlp(text);
      targetPos = util.pick(['nouns', 'places', 'people']);
      filtered = util.pickCount(n[targetPos]().out(`array`), 50),
      descr = `adjective strategy`;

      let adjs = util.pickCount(corpora.getFile('words', 'adjs').adjs, 50),
          word = filtered[0].trim(),
          adj = adjs[0];

      if (util.coinflip()) {
        filtered = filtered.map(w => util.pickRemove(adjs) + ` ${word}`);
        descr = `adjectives + single ${targetPos}`;
      } else {
        filtered = filtered.map(w => adj + ' ' + w);
        descr = `single adjective + ${targetPos}`;
      }

    };

    let weirdStrategy = function() {

      // TODO: alternate name list
      // TODO alternate templates (add in adjectives, f'r instance)
      // optionally append parenthetical adjective - c:\projects\corpora\data\foods\wine_descriptions.jso
      // exclamation
      // someting else (a tube station?)
      // TODO: need to bypass cleanup (which is removing the possessives)
      let parts = corpora.getFile('humans', 'bodyParts').bodyParts,
          people = corpora.getFile('humans', 'celebrities').celebrities,
          // list = new Array(50).fill().map(l => `${util.pickRemove(people)}'s ${util.pick(parts)}`).sort();
          list = []; //.map(l => `${util.pickRemove(people)}'s ${util.pick(parts)}`).sort();
      for (let i = 0; i < 50; i++) {
        list[i] = util.pickRemove(people) + "'s " +  util.pick(parts);
      }

      filtered = list.sort();
      descr = `person + body part`;
    };

    // looking at compromise tags @ https://github.com/nlp-compromise/compromise/blob/5596d9286e5228278dfcd956d5b98cf9adc0912c/src/sentence/pos/parts_of_speech.js
    let strategies = [
      weirdStrategy,
      posStrategyAdj,
      posStrategyAdj,
      posStrategyAdj,
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

    // TODO: return everything explicitly, instead of using globals...
    return {
      parts: filtered || [],
      description: descr
    };
  };


  let titlifier = function() {

    // c:\projects\corpora\data\games\jeopardy_questions.json
    // category, question
    // use category of 2+ words (contains a space)
    let t,f =[], title;

    try {
      if (util.coinflip()) {
        t = corpora.getFile('games', 'jeopardy_questions').questions;
        f = t.filter(o => o.category.indexOf(' ') > 0);
        title = util.pick(f).category;
      } else {
        t = corpora.getFile('divination', 'tarot_interpretations').tarot_interpretations;
        t.map(o => f = f.concat(o.fortune_telling, o.meanings.light, o.meanings.shadow));
        title = util.pick(f);
      }
    } catch(e) {
      console.log(e);
    }
    return title;
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

    // TODO: not all strategies require nlp, so this is wasted computing....
    let //r = nlp(text),
      strategy = textFilter(text),
    pos = strategy.parts,
    // textutil throws error on empty array
    // bypass cleaner if not required
    subset = (pos.length === 0) ? [] : util.pickCount(pos,50).map(n => wordCleaner(textutil.cleaner(n)));

    let wordbag = textutil.wordbag(subset),
        cleaned = Object.keys(wordbag).map(k => wordbag[k].word),
        sorter = util.pick([caseInsensitiveSort, lengthSort]),
        sorted = util.coinflip() ? cleaned : cleaned.sort(sorter),
        title = titlifier();

    sorted = util.coinflip() ? sorted : sorted.map(w => w.toUpperCase());

    return {
      // TODO: sort options
      // DONE: alpha, reverse alpha, length,
      // TODO: other thngs (number of vowells???)
      // scrabble score sort
      // TODO: name only if using source text
      list: util.coinflip() ? sorted : sorted.reverse(),
      metadata: { name: name,
                  strategy: strategy.description,
                  title: title
                }
    };
  };

  this.getList = getList;

  return this;

};

module.exports = Listmania;
