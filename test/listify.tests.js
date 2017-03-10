'use strict';

// execute with `mocha test.js`

(function() {

  let expect = require(`chai`).expect,
      Listifier = require(`../lib/listify`),
      newlistifier = new Listifier();

  // for functional tests
  let getText = function() {

    let Corpora = require(`common-corpus`),
        corpora = new Corpora(),
        source = corpora.texts,
        textObj = source[2], // eh.....
        blob = textObj.text();

    return {
      text: blob,
      source: textObj.name
    };

  };

  describe(`listifier`, function() {

    describe(`API`, function() {
      it(`should return a new instance with new`, function() {
        expect(newlistifier).to.be.a(`object`);
        expect(newlistifier).to.be.an.instanceof(Listifier);
      });

      it(`should return a new instance even without new`, function() {
        var listifier = Listifier();
        expect(listifier).to.be.a(`object`);
        expect(listifier).to.be.an.instanceof(Listifier);
      });

      it(`should expose a getList method`, function() {
        expect(newlistifier.getList).to.be.a(`function`);
      });
    });

    describe(`functional tests`, function() {
      let list = newlistifier.getList({text: getText()});
      it(`should return an object`, function() {
        expect(list).to.be.an(`object`);
      });
      describe(`object should have a list`, function() {
        it(`that is an array`, function() {
          expect(list.list).to.be.an(`array`);
        });
        // NOTE: as it currently stands, the lib will sometimes return an empty list
        // if the match is not found, for example
        // so... need some better way of testing/noting this
        // since it's a valid return case
        it(`having zero or non-zero length`, function() {
          expect(list.list).to.have.length.above(-1);
        });
        it(`and contain strings (or nothing`, function() {
          // if list.list has elements, they are all strings
          // OR it does not have elements
          expect(list.list.filter(e => typeof e === `string`)).to.have.length(list.list.length);
        });
      });
      it(`object should have metadata`, function() {
        expect(list.metadata).to.be.an(`object`);
      });
    });

  });

}());
