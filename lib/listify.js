'use strict'

let Listmania = function () {
  if (!(this instanceof Listmania)) {
    return new Listmania()
  }

  let nlp = require(`compromise`)
  let util = new (require(`./util`))()
  let textutil = require(`./textutil.js`)
  let corpora = require(`corpora-project`)

  // word, as opposed to sentences or larger
  // so we remove punctuation, etc.
  let wordCleaner = function (word) {
    // single-apostrophes left for now (posessive and contractions)
    // need a better algorithm....
    let clean = word.trim().replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$|[()_,"]|-+/g, ``).replace(/\s+/g, ` `)
    return clean.trim()
  }

  // TODO: put all of the corpora and data-pull code into a separate module
  let interjections = () => corpora.getFile(`words`, `interjections`).interjections

  let stations = () => corpora.getFile(`geography`, `london_underground_stations`).stations.map(s => s.name.trim())

  let disappearance = () => [`lost`, `stolen`, `misplaced`, `missing`, `stray`, `mislaid`, `gone`, `sold`, `pawned`, `poker game`, `exchanged`, `contract revoked`, `loaned out`, `traded`, `destroyed`, `confiscated`, `forfeited`, `hijacked`, `misappropriated`, `snatched`, `ripped off`, `swiped`, `abducted`, `filched`, `returned`, `retained`, `embezzled`, `wandered off`, `buried at sea`, `broken`, `taken by magpie`]

  let wine = () => corpora.getFile(`foods`, `wine_descriptions`).wine_descriptions

  // NOTE: skips all one-word questions
  let jeopardy = function () {
    let t = corpora.getFile(`games`, `jeopardy_questions`).questions
    return t.filter(o => o.category.indexOf(` `) > 0).map(o => o.category)
  }

  let jeopardyAnswers = function () {
    let t = corpora.getFile(`games`, `jeopardy_questions`).questions
    return t.map(o => o.answer)
  }

  let tarot = function () {
    let t = corpora.getFile(`divination`, `tarot_interpretations`).tarot_interpretations
    let r = t.reduce((p, c) => p.concat(c.fortune_telling, c.meanings.light, c.meanings.shadow), [])
    return r
  }

  let adjectives = () => corpora.getFile(`words`, `adjs`).adjs
  let bodyparts = () => corpora.getFile(`humans`, `bodyParts`).bodyParts
  let celebrities = () => corpora.getFile(`humans`, `celebrities`).celebrities
  let nsaCodenames = () => corpora.getFile(`governments`, `nsa_projects`).codenames
  let wrestlingMoves = () => corpora.getFile(`games`, `wrestling_moves`).moves
  let proverbs = function () {
    let t = corpora.getFile(`words`, `proverbs`).proverbs
    const p = t.reduce((p, c) => p.concat(c[Object.keys(c)[0]]), [])
    return p
  }

  let diagnoses = function () {
    let t = corpora.getFile(`medicine`, `diagnoses`).codes.map(o => o.desc)
    return t
  }

  // this is the core "listifier"
  // it's not the best name, since it also builds up lists from component parts
  let buildList = function (config) {
    let targetPos; let template

    let text = config.text.text

    let matchStrategyFactory = function (tmpl) {
      return function () {
        let n = nlp(text)
        template = tmpl
        return {
          filtered: n.match(template).out(`array`).map(n => wordCleaner(textutil.cleaner(n))),
          descr: `match: '${template}'`
        }
      }
    }

    let posStrategy = function () {
      let n = nlp(text)
      targetPos = util.pick([`nouns`, `adjectives`, `adverbs`, `places`, `verbs`, `values`, `people`])
      return {
        filtered: n[targetPos]().out(`array`).map(n => wordCleaner(textutil.cleaner(n))),
        descr: `pos: ${targetPos}`
      }
    }

    // buncha voodoo code....
    let posStrategyAdj = function () {
      let n = nlp(text); let filtered; let descr

      targetPos = util.pick([`nouns`, `places`, `people`])
      filtered = util.pickCount(n[targetPos]().out(`array`), 50)

      // let adjs = util.pickCount(corpora.getFile('words', 'adjs').adjs, 50),
      let adjs = util.pickCount(adjectives(), 50)

      let word = filtered[0].trim()

      let adj = adjs[0]

      if (util.coinflip()) {
        filtered = filtered.map(() => util.pickRemove(adjs) + ` ${word}`)
        descr = `adjectives + single ${targetPos}`
      } else {
        filtered = filtered.map(w => adj + ` ` + w)
        descr = `single adjective + ${targetPos}`
      }

      return {
        filtered: filtered.map(n => wordCleaner(textutil.cleaner(n))),
        descr: descr
      }
    }

    // TODO: better name for this function
    // TODO: stations shouldn't just be London tube stations (expand, please)
    let weirdStrategy = function () {
      // TODO: alternate name list
      let parts = bodyparts()
      // corpora.getFile('humans', 'bodyParts').bodyParts,

      let people = celebrities()
      // corpora.getFile('humans', 'celebrities').celebrities,

      let suffixList = util.pick([diagnoses(), interjections(), stations(), disappearance(), wine()])

      let chancer = util.coinflip(0.3) ? () => { return true } : () => util.coinflip(0.3)

      let adjs = util.pick([adjectives(), wine()])

      let adjective = util.pick(adjs)

      let part = util.pick(parts)

      let followup = () => chancer() ? ` (${util.pick(suffixList)})` : ``

      let party = util.pick([
        () => util.pick(parts), // different part for each item
        () => part // same part for each item
      ])

      let template = util.pick([
        () => `${util.pickRemove(people)}'s ${party()}${followup()}`,
        () => `${util.pickRemove(people)}'s ${util.pick(adjs)} ${party()}`,
        () => `${util.pickRemove(people)}'s ${adjective} ${party()}`
      ])

      let list = new Array(50).fill().map(() => template())
      return {
        filtered: list.sort(),
        descr: `person + body part`
      }
    }

    let matchPatternFactory = function () {
      let tags = [`Acronym`, `Adjective`, `Adverb`, `Auxillary`, `Cardinal`, `City`,
        `ClauseEnd`, `Comparative`, `Condition`, `Conjunction`, `Contraction`,
        `Copula`, `Country`, `Currency`, `Date`, `Demonym`, `Determiner`,
        `Duration`, `Expression`, `FemaleName`, `FirstName`, `FuturePerfect`,
        `Gerund`, `Holiday`, `Infinitive`, `LastName`, `MaleName`, `Modal`,
        `Money`, `Month`, `Negative`, `NiceNumber`, `Noun`, `NounPhrase+`, `NumberRange`,
        `NumericValue`, `Ordinal`, `Organization`, `Participle`, `Particle`,
        `PastTense`, `PerfectTense`, `Person`, `Place`, `Pluperfect`,
        `Plural`, `Possessive`, `Preposition`, `PresentTense`, `Pronoun`,
        `QuestionWord`, `Quotation`, `RelativeDay`, `Singular`, `Superlative`,
        `Time`, `Unit`, `Value`, `Verb`, `VerbPhrase+`, `WeekDay`, `Year`]

      let tag = util.pick(tags)
      if (util.coinflip()) { tag = tag.indexOf(`+`) > 0 ? tag : tag + `+` }
      let template = util.pick([`#${tag}`, `. #${tag} .`,
        `. (#${util.pick(tags)}|#${util.pick(tags)})+ .`])
      if (util.coinflip(0.75)) {
        let max = util.randomInRange(4, 10)
        template = template.replace(/\./g, `{1,${max}}`)
      }
      return matchStrategyFactory(template)
    }

    // looking at compromise tags @ https://github.com/nlp-compromise/compromise/blob/5596d9286e5228278dfcd956d5b98cf9adc0912c/src/sentence/pos/parts_of_speech.js
    let matchStrats = [matchStrategyFactory(`#Adjective #Noun . (are|is) . #Adjective #Noun`),
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
      matchStrategyFactory(`not #Noun`),
      matchStrategyFactory(`of #Noun and #Noun`)
      // `#Person .? #Gerund`
      // `#Noun+ .? #Gerund`
      // `#Gerund .? #Noun+`
      // `#Gerund+ .? #Gerund+`
      // `. (#Date|#Value) .`
      // looks like EVERYTHING _should be_ in https://github.com/nlp-compromise/compromise/blob/master/src/tags/tree.js
    ]

    let posStrats = [posStrategy,
      posStrategy,
      posStrategy,
      posStrategy,
      posStrategy,
      posStrategy,
      posStrategy]

    let posStratAdjs = [posStrategyAdj,
      posStrategyAdj,
      posStrategyAdj,
      posStrategyAdj,
      posStrategyAdj,
      posStrategyAdj,
      posStrategyAdj,
      posStrategyAdj,
      posStrategyAdj,
      posStrategyAdj]

    let weirdStrats = [weirdStrategy,
      weirdStrategy,
      weirdStrategy]

    let patternStrats = [matchPatternFactory(),
      matchPatternFactory(),
      matchPatternFactory(),
      matchPatternFactory(),
      matchPatternFactory(),
      matchPatternFactory(),
      matchPatternFactory(),
      matchPatternFactory(),
      matchPatternFactory(),
      matchPatternFactory()]

    let strategies = matchStrats.concat(posStrats, posStratAdjs, weirdStrats, patternStrats)

    // TODO: if type of strategy passed in, use it
    // if type is matchPattern and a pattern is passed in, use them
    let strategy

    if (config.method) {
      let FuzzyMatching = require(`fuzzy-matching`)

      let buildMethods = [`matchStrats`, `posStrats`, `posStratAdjs`, `weirdStrats`, `patternStrats`]

      let fmMethods = new FuzzyMatching(buildMethods)

      let method = fmMethods.get(config.method).value

      switch (method) {
        case `matchStrats`:
          strategy = matchStrats
          break

        case `posStrats`:
          strategy = posStrats
          break

        case `posStratAdjs`:
          strategy = posStratAdjs
          break

        case `weirdStrats`:
          strategy = weirdStrats
          break

        case `patternStrats`:
        default:
          strategy = patternStrats
          break
      }
    }

    var list = (config.matchPattern
      ? matchStrategyFactory(config.matchPattern)
      : util.pick(strategy || strategies))()

    // TODO: return everything explicitly, instead of using globals...
    // er.... we do, don't we?
    return {
      parts: list.filtered || [],
      description: list.descr
    }
  }

  let titlifier = function () {
    let source = util.pick([jeopardyAnswers(), wrestlingMoves(), proverbs(), proverbs(), jeopardy(), tarot(), jeopardy(), tarot()])

    let title = util.pick(source)

    let codename = util.pick(nsaCodenames())

    // clean text by removing final punct
    title = title.replace(/[?.!]$/g, ``)

    return title + (util.coinflip(0.2) ? ` (${codename})` : ``)
  }

  let caseInsensitiveSort = function (a, b) {
    a = a.toUpperCase() // ignore upper and lowercase
    b = b.toUpperCase() // ignore upper and lowercase
    if (a < b) {
      return -1
    }
    if (a > b) {
      return 1
    }

    return 0
  }

  let lengthSort = function (a, b) {
    if (a.length < b.length) {
      return -1
    }
    if (a.length > b.length) {
      return 1
    }

    return 0
  }

  let getList = function (config) {
    // idea: parse text into sentences
    // grab n _short_ sentences [where short is .... ???]

    // idea: quotes from text (people speaking, with quotation marks)
    // NOTE: must be a complete sentence.

    // https://en.wikipedia.org/wiki/List_of_lists_of_lists

    // get a noun from word source
    // get a list of adjective
    // COMBINE

    // etc.

    let name = `USER PROVIDED`

    if (typeof config.text === `object`) {
      name = config.text.source
    }

    let strategy = buildList(config)

    let pos = strategy.parts

    let subset = pos

    let wordbag = textutil.wordbag(subset)

    let cleaned = Object.keys(wordbag).map(k => wordbag[k].word)

    let sorter = util.pick([caseInsensitiveSort, lengthSort])

    let sorted = util.coinflip() ? cleaned : cleaned.sort(sorter)

    let title = titlifier()

    let listMax = util.random(util.pick([20, 20, 25, 25, 25, 50, 50, 100]))

    sorted = util.coinflip() ? sorted : sorted.map(w => w.toUpperCase())

    sorted = util.pickCount(sorted, (listMax > sorted.length ? sorted.length : listMax))

    return {
      // TODO: sort options
      // DONE: alpha, reverse alpha, length,
      // TODO: other thngs (number of vowells???)
      // scrabble score sort
      // TODO: source only if using source text
      list: util.coinflip() ? sorted : sorted.reverse(),
      metadata: { source: name,
        strategy: strategy.description,
        title: title,
        length: sorted.length
      }
    }
  }

  this.getList = getList

  return this
}

module.exports = Listmania
