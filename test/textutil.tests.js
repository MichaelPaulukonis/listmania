'use strict';

// execute with `mocha test.js`

(function() {

  var chai = require(`chai`),
      expect = chai.expect,
      textutils = require(`../lib/textutil.js`);


  describe(`textutil`, function() {

    describe(`API`, function() {
      it(`Util should expose a wordfreqs method`, function() {
        expect(textutils.wordfreqs).to.be.a(`function`);
      });

      it(`Util should expose a wordbag method`, function() {
        expect(textutils.wordbag).to.be.a(`function`);
      });

      it(`should expose a cleaner method`, function() {
        expect(textutils.cleaner).to.be.a(`function`);
      });

      it(`should expose a splitwords method`, function() {
        expect(textutils.splitwords).to.be.a(`function`);
      });

      it(`should expose a fonetikfix method`, function() {
        expect(textutils.fonetikfix).to.be.a(`function`);
      });
    });

    describe(`fonetikfix`, function() {
      it(`should replace 0s at the beginning of words with 'th'`, function() {
        let ftext = `0e`,
            cleantext = `the`;
        expect(textutils.fonetikfix(ftext)).to.equal(cleantext);
      });
      it(`should replace 0s at the middle of words with 'th'`, function() {
        let ftext = `o0er`,
            cleantext = `other`;
        expect(textutils.fonetikfix(ftext)).to.equal(cleantext);
      });
      it(`should replace 0s at the end of words with 'th'`, function() {
        let ftext = `wi0`,
            cleantext = `with`;
        expect(textutils.fonetikfix(ftext)).to.equal(cleantext);
      });
    });

    describe(`splitwords`, function() {
      let  splits = textutils.splitwords(`Hey we're the monkeys. Aren't we?`);
      it(`should return an array (of 6 words)`, function() {
        expect(splits).to.be.instanceOf(Array);
        expect(splits.length).to.equal(6);
      });
      it(`should not split contractions (we're, aren't)`, function() {
        expect(splits[1]).to.equal(`we're`);
        expect(splits[4]).to.equal(`Aren't`);
      });
    });

    describe(`wordbag`, function() {
      let bag = textutils.wordbag(`Hey we're the monkeys. Aren't we?`),
          keys = Object.keys(bag);

      it(`should return an object`, function() {
        expect(bag).to.be.an(`object`);
      });

      it(`should ignore common stop words(we're, the, aren't, we)`, function() {
        let commonStops = [`we're`, `the`, `aren't`, `we`];
        expect(commonStops.filter(sw => keys.indexOf(`_` + sw) > -1).length).to.equal(0);
      });

      it(`should contain the two non-stop words`, function() {
        let expectedWords = [`Hey`, `monkeys`];
        // keys now have a leading underscore, to get around JS reserved word issues
        // ("constructor" was the known issue)
        expect(keys.filter(key => expectedWords.indexOf(key.slice(1)) > -1).length).to.equal(2);
      });
    });

    describe(`wordfreqs`, function() {
      var wf = textutils.wordfreqs(`this is some text`);
      it(`should return an array`, function() {
        expect(wf).to.be.instanceOf(Array);
      });
      it(`each element should be an object`, function() {
        expect(wf[0]).to.be.an(`object`);
      });
      it(`the element should have a word property, that is a string`, function() {
        expect(wf[0].word).to.be.a(`string`);
      });
      it(`shouls have a count property that is a number`, function() {
        expect(wf[0].count).to.be.an(`number`);
      });
    });

    describe(`cleaner`, function() {
      var unbalancedParens = `some text(that needs[cleaning]`,
          unbalancedBrackets = `some text(that needs[cleaning)`,
          cleanParens = textutils.cleaner(unbalancedParens),
          cleanBrackets = textutils.cleaner(unbalancedBrackets);
      it(`should return a string`, function() {
        expect(cleanParens).to.be.a(`string`);
        expect(cleanBrackets).to.be.a(`string`);
      });
      it(`should remove unbalancedParens`, function() {
        expect(cleanParens.match(/\(|\)/g)).to.be.null;
      });
      it(`should remove unbalancedBrackets`, function() {
        expect(cleanBrackets.match(/\[|\]/g)).to.be.null;
      });
      it(`should not remove balanced parens`, function() {
        expect(cleanBrackets.match(/\(|\)/g)).to.not.be.null;
      });
      it(`should not remove balanced brackets`, function() {
        expect(cleanParens.match(/\[|\]/g)).to.not.be.null;
      });
    });

  });

}());


// var textutils = require('./lib/textutil.js'),
//     wordfreqs = textutils.wordfreqs(text),
//     title = '';

// if (wordfreqs.length > 4) {
//   var wordCount = util.getRandomInRange(2, wordfreqs.length > 10 ? 10 : 4);
//   title = wordfreqs.slice(0,wordCount).map(function(elem) { return elem.word; }).join(' ');
// } else {
//   title = wordfreqs[0].word;
// }

// return title.toUpperCase();
