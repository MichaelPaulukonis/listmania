'use strict';

let Listmania = function() {

    if(!(this instanceof Listmania)) {
        return new Listmania();
    }

    let nlp = require('compromise'),
        util = new require('./util')();

    var getList = function(text) {
        // TODO: implement

        // idea: parse text into POS
        // grab n of tag x

        // idea: parse text into sentences
        // grab n _short_ sentences [where short is .... ???]

        // idea: quotes from text (people speaking, with quotation marks)
        // NOTE: must be a complete sentence.

        let r = nlp(text),
            nouns = r.nouns().out('array').map(n => n.trim()),
            subset = util.pickCount(nouns,20);

        return {
            list: subset,
            metadata: ['emptylist']
        };
    };

    this.getList = getList;

};

module.exports = Listmania;
