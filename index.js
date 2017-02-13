'use strict';

let listifier = new require('./lib/listify')(),
    textutils = require(`./lib/textutil.js`),
    util = require('./lib/util.js')(),
    config = {};

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


let program = require(`commander`);
program
  .version(`0.0.3`)
  .option(`-c, --corporaFilter [string]`, `filename substring filter (non-case sensitive)`)
// TODO: provide a match-filter on the command-line?
  .parse(process.argv);


if (program.corporaFilter) {
  config.corporaFilter = program.corporaFilter;
}


let text = getText(config.corporaFilter),
    list = listifier.getList(text);

console.log(JSON.stringify(list, null, 2));
