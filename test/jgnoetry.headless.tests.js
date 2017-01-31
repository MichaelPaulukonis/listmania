'use strict';

// execute with `mocha test.js`

(function() {

  var chai = require(`chai`),
      expect = chai.expect,
      Util = require(`../lib/util.js`),
      util = new Util(),
      jGnoetry = require(`../lib/jgnoetry.headless.js`),
      jg = new jGnoetry(util);

  describe(`jGnoetry.headless tests`, function() {

    describe(`API tests`, function() {
      it(`should return a new instance with new`, function() {
        var jg = new jGnoetry(util);
        expect(jg).to.be.a(`object`);
        expect(jg).to.be.an.instanceof(jGnoetry);
      });

      it(`should return a new instance even without new`, function() {
        var jg = jGnoetry(util);
        expect(jg).to.be.a(`object`);
        expect(jg).to.be.an.instanceof(jGnoetry);
      });

      it(`should expose a generate method`, function() {
        expect(jg.generate).to.be.a(`function`);
      });

      // TODO: makeTemplate exposure
      it(`should expose a makeTemplate method`, function() {
        expect(jg.makeTemplate).to.be.a(`function`);
      });

      it(`should expose a countSyllables method`, function() {
        expect(jg.countSyllables).to.be.a(`function`);
      });
    });

    describe(`generate()`, function() {
      it(`should return a string when called with proper params`, function() {
        // TODO: this setup is a pain in the ass!
        // can't there some sort of default stuff built in?

        var options = {'handlePunctuation': `noParen`, 'byNewlineOrPunctuation': `punctuation`, 'capitalize': { 'method': `capitalizeCustom`, 'customSentence': true, 'customLine': true, 'customI': true }, 'appendToPoem': `appendPeriod`, 'areWordsSelectedBegin': `startSelected`, 'thisWordSelectedBegin': `startSelected`, 'changeSelectionEffect': `requiresClick`, 'statusVerbosity': 1},
            corpora = {texts: [`this is the cat that was over there with the mill.`], weights: [100]},
            template = `[s] [n] `,
            existingText = ``;

        // corpora.texts = reduceCorpora(corpora.texts);
        // corpora.weights = assignWeights(corpora.texts.length);
        // var templateName = util.pick(Object.keys(templates));
        // options.capitalize = assignCapitalization();
        // options.appendToPoem = util.pick(endPuncts);

        var output = jg.generate(template, options, corpora, existingText);

        expect(output).to.be.an(`object`);
      });

      /*
       TODO: there is a bug (?) where existing text is shifted becuase new words have too many syllables

       ex: [s] [s] [s] [s] [s] [s] => s s {{random}} s s (where {{..}} denote "kept" text)
       output: Shake gently random from =< s s s {{random}} s
       Cannot reproduce "on-demand" since it randomly outputs this stuff
       need to wire-up a random-seed thing, and then trap a random seed for an instance when it happens
       NOTE: I'm reproducing this in the GUI version, so need to get tests in here once random-seed is set up
       */
      it(`should keep existingText when told`, function() {
        var options = {'handlePunctuation': `noParen`, 'byNewlineOrPunctuation': `punctuation`, 'capitalize': { 'method': `capitalizeCustom`, 'customSentence': true, 'customLine': true, 'customI': true }, 'appendToPoem': `appendPeriod`, 'areWordsSelectedBegin': `startSelected`, 'thisWordSelectedBegin': `startSelected`, 'changeSelectionEffect': `requiresClick`, 'statusVerbosity': 1},
            corpora = { texts: [`the cat the dog the oboe and the mill were in the dob barn with the rat`], weights: [100]},
            template = `[s] [s] [n] `,
            existingText = [ { text: `the`, keep: true }, { text: `the`, keep: false } ];

        var output = jg.generate(template, options, corpora, existingText),
            // hrm. we've got a leading-space issue in jgnoetry....
            // hey... displayText is a STUPID NAME for a headless module...
            words = output.displayText.trim().split(` `);

        expect(output).to.be.an(`object`);
        expect(output.displayText).to.be.a(`string`);
        expect(words[0].toLowerCase()).to.equal(existingText[0].text.toLowerCase());
      });

    });

    describe(`syllableCount tests`, function() {

      // expect(jg.countSyllables).to.be.a('function');
      let sylbs = [ [`and`, 1], [`but`, 1], [`hate`, 1]  ];
      for (let i = 0, len = sylbs.length; i < len; i++) {
        let s  = sylbs[i];
        it(`should count syllables correctly for '${s[0]}' with algorithm (non-exception words)`, function() {
          expect(jg.countSyllables(s[0])).to.equal(s[1]);
        });
      }

      let knownFailSylbs = [ [`apple`, 1] ];
      for (let i = 0, len = knownFailSylbs.length; i < len; i++) {
        let s  = knownFailSylbs[i];
        it(`counts the wrong syllable count for '${s[0]}' := ${s[1]} with algorithm (non-exception words)`, function() {
          expect(jg.countSyllables(s[0])).to.equal(s[1]);
        });
      }

    });


  });

}());
