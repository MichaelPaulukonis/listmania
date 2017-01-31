'use strict';

(function() {

  let expect = require(`chai`).expect,
      util = new require(`../lib/util.js`)(),
      newcorpora = new require(`../lib/corpora`)(),
      BucketRunner = require(`../lib/bucketRunner.js`),
      // must provide util AND texts
      // texts 0 (history of art, > 2000ms) ,1 are a bit long. ugh. this is awkward
      // 2 is Ginsberg's Howl
      bucketRunner = new BucketRunner({util: util, config: {}, texts: [newcorpora.texts[2]]});

  describe(`bucketRunner tests`, function() {
    describe(`API`, function() {
      it(`should return a new instance with new`, function() {
        var newbr = new BucketRunner({util: util, texts: [newcorpora.texts[2]]});
        expect(newbr).to.be.a(`object`);
        expect(newbr).to.be.an.instanceof(BucketRunner);
      });

      it(`should return a new instance even without new`, function() {
        var br = new BucketRunner({util: util, texts: [newcorpora.texts[2]]});
        expect(br).to.be.a(`object`);
        expect(br).to.be.an.instanceof(BucketRunner);
      });

      it(`should throw a custom error if not provided with a util`, function() {
        expect(function() {
          new BucketRunner({texts: [newcorpora.texts[2]]});
        }).to.throw(`util must be supplied as part of opts`);
      });

      it(`should throw a custom error if not provided with an array of text objects`, function() {
        expect(function() {
          new BucketRunner({util: util});
        }).to.throw(`texts array must be supplied as part of opts`);
      });

      it(`should expose a generate method`, function() {
        expect(bucketRunner.generate).to.be.a(`function`);
      });
    });

    // TODO: a) this is slow b) atomize the tests
    describe(`generate tests`, function() {

      let poem = bucketRunner.generate();

      it(`should return an object (poem)`, function() {
        expect(poem).to.be.an(`object`);
      });
      it(`poem should contain text`, function() {
        expect(poem.text).to.be.a(`string`);
      });

      it(`poem should contain lines`,  function() {
        expect(poem.lines).to.be.an(`array`);
      });

      it(`poem should contain config object`,  function() {
        expect(poem.config).to.be.an(`object`);
      });

      // HRM - this is a tricky one. can we return a single line?
      it(`should return multiple lines`, function() {
        expect(poem.text.split(`\n`)).to.have.length.above(2);
      });

      // TODO: this should apply to each and every type of output from the runner
      it(`should end every line with a punctuation mark`, function() {
        // TODO: implement a test, then implement code
        var re = /[.?!]$|^$/;
        // console.log(poem.lines);
        expect(poem.lines.reduce((p,c) => p && re.test(c), true)).to.be.true;
      });

    });

  });

}());
