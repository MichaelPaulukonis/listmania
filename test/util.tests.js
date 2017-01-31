'use strict';

// execute with `mocha test.js`

(function() {

  var chai = require(`chai`),
      expect = chai.expect,
      Util = require(`../lib/util.js`),
      util = new Util();


  describe(`util tests`, function() {

    describe(`API tests`, function() {

      it(`should return a new instance with new`, function() {
        var newutil = new Util();
        expect(newutil).to.be.a(`object`);
        expect(newutil).to.be.an.instanceof(Util);
      });

      it(`should return a new instance even without new`, function() {
        var util = Util();
        expect(util).to.be.a(`object`);
        expect(util).to.be.an.instanceof(Util);
      });

      it(`should expose a debug method`, function() {
        expect(util.debug).to.be.a(`function`);
      });

      it(`should expose a debugOutput method`, function() {
        expect(util.debugOutput).to.be.a(`function`);
      });

      it(`should expose a randomProperty method`, function() {
        expect(util.randomProperty).to.be.a(`function`);
      });

      it(`should expose a pick method`, function() {
        expect(util.pick).to.be.a(`function`);
      });

      it(`should expose a pickCount method`, function() {
        expect(util.pickCount).to.be.a(`function`);
      });

      it(`should expose a random method`, function() {
        expect(util.random).to.be.a(`function`);
      });

      it(`should expose a randomInRange method`, function() {
        expect(util.randomInRange).to.be.a(`function`);
      });

      it(`should expose a coinflip method`, function() {
        expect(util.coinflip).to.be.a(`function`);
      });

      it(`should expose a pickRemove method`, function() {
        expect(util.pickRemove).to.be.a(`function`);
      });

      it(`should expose a shuffle method`, function() {
        expect(util.shuffle).to.be.a(`function`);
      });

      // TODO: okay, now actually test the methods!

    });

  });

}());
