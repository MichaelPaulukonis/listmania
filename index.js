'use strict';

let listifier = new require('./lib/listify')(),
    util = require('./lib/util.js')({statusVerbosity: 0}),
    config = require(`./config.js`),
    Tumblr = require(`tumblrwks`),
    ALWAYS_PRINT = 0;

let tumblr = new Tumblr(
  {
    consumerKey:    config.consumerKey,
    consumerSecret: config.consumerSecret,
    accessToken:    config.accessToken,
    accessSecret:   config.accessSecret
  },
  `leanstooneside.tumblr.com`
);

let logger = function(msg) {
  util.debug(msg, ALWAYS_PRINT);
};
util.log = logger;



var getText = function() {

  let Corpora = require(`./lib/corpora.js`),
      corpora = new Corpora(),
      source = config.corporaFilter ? corpora.filter(config.corporaFilter) : corpora.texts,
      chars = 50000,
      textObj = util.pick(source),
      text = textObj.text(),
      startPos = util.randomInRange(0, text.length - chars),
      blob = text.slice(0,chars);

  return {
    text: blob,
    source: textObj.name
  };

};

// poem := list
var prepForPublish = function(poem) {
  let data,
      dataline;

  data = JSON.parse(JSON.stringify(poem));

  dataline = `<!-- config: ${JSON.stringify(data.metadata)} -->`;

  return `<ol>` + data.list.map(l => `<li>${l}</li>`).join(``) + `</ol>${dataline}`;
};

let teller = function() {


  let text = getText(config.corporaFilter),
      list = listifier.getList(text);

  if (list && list.list && list.list.length > 0) {

    list.printable = prepForPublish(list);

    if (config.postLive) {
      // TODO: optionally dump in other info for "hidden" display?
      tumblr.post(`/post`,
                  {type: `text`, title: list.metadata.title, body: list.printable},
                  function(err, json) { // eslint-disable-line no-unused-vars
                    if (err) {
                      logger(JSON.stringify(err));
                      logger(err);
                    }
                  });
    } else {
      logger(JSON.stringify(list, null, 2));
    }
  }

};


let program = require(`commander`);
program
  .version(`0.0.3`)
  .option(`-c, --corporaFilter [string]`, `filename substring filter (non-case sensitive)`)
// TODO: provide a match-filter on the command-line?
  .parse(process.argv);


if (program.corporaFilter) {
  config.corporaFilter = program.corporaFilter;
}

teller();
