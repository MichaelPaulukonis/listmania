const listifier = new (require('./lib/listify'))()
const util = require('./lib/util.js')({ statusVerbosity: 0 })
const config = require('./config.js')
const Tumblr = require('tumblrwks')
const ALWAYS_PRINT = 0
const { prepForPublish, prefixifiers } = require('./lib/prep')

const tumblr = new Tumblr(
  {
    consumerKey: config.consumerKey,
    consumerSecret: config.consumerSecret,
    accessToken: config.accessToken,
    accessSecret: config.accessSecret
  },
  'leanstooneside.tumblr.com'
)

const logger = function (msg) {
  util.debug(msg, ALWAYS_PRINT)
}
util.log = logger

const getText = function () {
  const Corpora = require('common-corpus')
  const corpora = new Corpora()
  const source = config.corporaFilter ? corpora.filter(config.corporaFilter) : corpora.texts
  const chars = 50000
  const textObj = util.pick(source)
  const text = textObj.text()
  const startPos = util.randomInRange(0, text.length - chars)
  const blob = (text.length <= chars ? text : text.slice(startPos, startPos + chars))

  // console.log(`text.length: ${text.length} startPos: ${startPos} blob-borders: ${startPos+chars}`);

  return {
    text: blob,
    source: textObj.name
  }
}

const teller = function () {
  const text = getText(config.corporaFilter)
  let list = {}
  let attempt = 0

  while (attempt < 5) {
    attempt++
    list = listifier.getList({
      text,
      matchPattern: config.matchPattern,
      method: config.method
    })
    if (list.list && list.list.length > 0) {
      break
    }
  }

  if (list.list && list.list.length > 0) {
    const pfx = util.pick(Object.keys(prefixifiers))
    list.printable = prepForPublish(list, prefixifiers[pfx])

    // TODO: uh.... separate out posting from the listifier
    if (config.postLive) {
      tumblr.post('/post',
        { type: 'text', title: list.metadata.title, body: list.printable },
        function (err, _) {
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

const program = require('commander')
program
  .version('0.0.3')
  .option('-c, --corporaFilter [string]', 'filename substring filter (non-case sensitive)')
  .option('-p, --patternMatch [string]', 'nlp-compromise matchPattern for list elements')
  .option('-m, --method [string]', 'method-type (See index.js)')
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
