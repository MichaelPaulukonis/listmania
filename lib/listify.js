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


  let interjections = () => corpora.getFile('words','interjections').interjections;

  let stations = () => corpora.getFile('geography', 'london_underground_stations').stations.map(s => s.name.trim());

  let disappearance = () => ['lost', 'stolen', 'misplaced', 'missing', 'stray', 'mislaid', 'gone', 'sold', 'pawned', 'poker game', 'exchanged', 'contract revoked', 'loaned out', 'traded', 'destroyed', 'confiscated', 'forfeited', 'hijacked', 'misappropriated', 'snatched', 'ripped off', 'swiped', 'abducted', 'filched', 'returned', 'retained', 'embezzled', 'wandered off', 'buried at sea', 'broken', 'taken by magpie'];

  let wine = () => corpora.getFile('foods','wine_descriptions').wine_descriptions;

  // NOTE: skips all one-word questions
  let jeopardy = function() {
    let t = corpora.getFile('games', 'jeopardy_questions').questions;
    return t.filter(o => o.category.indexOf(' ') > 0).map(o => o.category);
  };

  let jeopardyAnswers = function() {
    let t = corpora.getFile('games', 'jeopardy_questions').questions;
    return t.map(o => o.answer);
  };

  let tarot = function() {
    let f = [],
        t = corpora.getFile('divination', 'tarot_interpretations').tarot_interpretations;
    t.map(o => f = f.concat(o.fortune_telling, o.meanings.light, o.meanings.shadow));
    return f;
  };

  let adjectives = () => corpora.getFile('words', 'adjs').adjs;
  let bodyparts = () => corpora.getFile('humans', 'bodyParts').bodyParts;
  let celebrities = () => corpora.getFile('humans', 'celebrities').celebrities;
  let nsaCodenames = () => corpora.getFile('governments', 'nsa_projects').codenames;
  let wrestlingMoves = () => corpora.getFile('games', 'wrestling_moves').moves;
  let proverbs = function() {
    let f = [],
        t = corpora.getFile('words', 'proverbs').proverbs;
    t.map(o => f = f.concat(o[Object.keys(o)[0]]));
    return f;
  };

  let diagnoses = function() {
    let f = [],
        t = corpora.getFile('medicine', 'diagnoses').codes.map(o => o.desc);
    return t;
  };

  let textFilter = function(text) {

    let targetPos, filtered, descr, template;

    let matchStrategyFactory = function(tmpl) {
      return function() {
        let n = nlp(text);
        template = tmpl;
        return {
          filtered: n.match(template).out(`array`).map(n => wordCleaner(textutil.cleaner(n))),
          descr: `match: '${template}'`
        };
      };
    };

    let posStrategy = function() {
      let n = nlp(text);
      targetPos = util.pick(['nouns', 'adjectives', 'adverbs', 'places', 'verbs', 'values', 'people']);
      return {
        filtered: n[targetPos]().out(`array`).map(n => wordCleaner(textutil.cleaner(n))),
        descr: `pos: ${targetPos}`
      };
    };

    // buncha voodoo code....
    let posStrategyAdj = function() {
      let n = nlp(text), filtered, descr;

      targetPos = util.pick(['nouns', 'places', 'people']);
      filtered = util.pickCount(n[targetPos]().out(`array`), 50),
      descr = `adjective strategy`;

      // let adjs = util.pickCount(corpora.getFile('words', 'adjs').adjs, 50),
      let adjs = util.pickCount(adjectives(), 50),
          word = filtered[0].trim(),
          adj = adjs[0];

      if (util.coinflip()) {
        filtered = filtered.map(w => util.pickRemove(adjs) + ` ${word}`);
        descr = `adjectives + single ${targetPos}`;
      } else {
        filtered = filtered.map(w => adj + ' ' + w);
        descr = `single adjective + ${targetPos}`;
      }

      return {
        filtered: filtered.map(n => wordCleaner(textutil.cleaner(n))),
        descr: descr
      };
    };

    let weirdStrategy = function() {

      // TODO: alternate name list
      // TODO alternate templates (add in adjectives, f'r instance)
      let parts = bodyparts(), //corpora.getFile('humans', 'bodyParts').bodyParts,
          people = celebrities(), //corpora.getFile('humans', 'celebrities').celebrities,
          suffixList = util.pick([diagnoses(), interjections(), stations(), disappearance(), wine()]),
          chancer = util.coinflip(0.3) ? () => { return true; } : () => util.coinflip(0.3),
          adjs = util.pick([adjectives(), wine()]),
          adjective = util.pick(adjs),
          part = util.pick(parts),
          followup = () => chancer() ? ` (${util.pick(suffixList)})` : ``,
          party = util.pick([
            () => util.pick(parts),
            () => part
          ]),
          template = util.pick([
            () => `${util.pickRemove(people)}'s ${party()}${followup()}`,
            () => `${util.pickRemove(people)}'s ${util.pick(adjs)} ${party()}`,
            () => `${util.pickRemove(people)}'s ${adjective} ${party()}`
          ]),
          // list = new Array(50).fill().map(l => `${util.pickRemove(people)}'s ${util.pick(parts)}${followup()}`);
          list = new Array(50).fill().map(l => template());
      return {
        filtered: list.sort(),
        descr: `person + body part`
      };
    };

    // looking at compromise tags @ https://github.com/nlp-compromise/compromise/blob/5596d9286e5228278dfcd956d5b98cf9adc0912c/src/sentence/pos/parts_of_speech.js
    let strategies = [
      weirdStrategy,
      weirdStrategy,
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
      matchStrategyFactory(`#Adjective #Noun . (are|is) . #Adjective #Noun`),
      matchStrategyFactory(`#Noun * are #Noun+`),
      matchStrategyFactory(`#Noun .? are #Noun+`),
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

    var list = util.pick(strategies)();

    // TODO: return everything explicitly, instead of using globals...
    return {
      parts: list.filtered || [],
      description: list.descr
    };
  };



  let titlifier = function() {

    let source = util.pick([jeopardyAnswers(), wrestlingMoves(), proverbs(), proverbs(), jeopardy(), tarot(), jeopardy(), tarot()]),
        title = util.pick(source),
        codename = util.pick(nsaCodenames());

    return title + (util.coinflip(0.2) ? ` (${codename})` : '');
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

    let strategy = textFilter(text),
        pos = strategy.parts,
        subset = pos;

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
      // TODO: source only if using source text
      list: util.coinflip() ? sorted : sorted.reverse(),
      metadata: { source: name,
                  strategy: strategy.description,
                  title: title
                }
    };
  };

  this.getList = getList;

  return this;

};

module.exports = Listmania;
