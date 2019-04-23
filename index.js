let listifier = new (require(`./lib/listify`))()
let util = require(`./lib/util.js`)({ statusVerbosity: 0 })
let config = require(`./config.js`)
let Tumblr = require(`tumblrwks`)
let ALWAYS_PRINT = 0

let tumblr = new Tumblr(
  {
    consumerKey: config.consumerKey,
    consumerSecret: config.consumerSecret,
    accessToken: config.accessToken,
    accessSecret: config.accessSecret
  },
  `leanstooneside.tumblr.com`
)

let logger = function (msg) {
  util.debug(msg, ALWAYS_PRINT)
}
util.log = logger

var getText = function () {
  let Corpora = require(`common-corpus`)
  let corpora = new Corpora()
  let source = config.corporaFilter ? corpora.filter(config.corporaFilter) : corpora.texts
  let chars = 50000
  let textObj = util.pick(source)
  let text = textObj.text()
  let startPos = util.randomInRange(0, text.length - chars)
  let blob = (text.length <= chars ? text : text.slice(startPos, startPos + chars))

  // console.log(`text.length: ${text.length} startPos: ${startPos} blob-borders: ${startPos+chars}`);

  return {
    text: blob,
    source: textObj.name
  }
}

// poem := list
var prepForPublish = function (poem) {
  const data = JSON.parse(JSON.stringify(poem))
  const dataline = `<!-- config: ${JSON.stringify(data.metadata)} -->`
  return `<ol>` + data.list.map(l => `<li>${l}</li>`).join(``) + `</ol>${dataline}`
}

let teller = function () {
  let text = getText(config.corporaFilter)
  let list = {}
  let attempt = 0

  while (attempt < 5) {
    attempt++
    list = listifier.getList({ text: text,
      matchPattern: config.matchPattern,
      method: config.method })
    if (list.list && list.list.length > 0) {
      break
    }
  }

  if (list.list && list.list.length > 0) {
    list.printable = prepForPublish(list)

    if (config.postLive) {
      // TODO: optionally dump in other info for "hidden" display?
      tumblr.post(`/post`,
        { type: `text`, title: list.metadata.title, body: list.printable },
        function (err, json) { // eslint-disable-line no-unused-vars
          if (err) {
            logger(JSON.stringify(err))
            logger(err)
          }
        })
    } else {
      logger(JSON.stringify(list, null, 2))
    }
  } else {
    console.log(`NO LIST FOR TEXT '${text.source}'`)
  }
}

let program = require(`commander`)
program
  .version(`0.0.3`)
  .option(`-c, --corporaFilter [string]`, `filename substring filter (non-case sensitive)`)
  .option(`-p, --patternMatch [string]`, `nlp-compromise matchPattern for list elements`)
  .option(`-m, --method [string]`, `method-type (See index.js)`)
  .parse(process.argv)

if (program.corporaFilter) {
  config.corporaFilter = program.corporaFilter
}

if (program.patternMatch) {
  config.matchPattern = program.patternMatch
}

if (program.method) {
  config.method = program.method
}

teller()
