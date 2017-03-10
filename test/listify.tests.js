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
      chars = 50000,
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
      it('should return an object', function() {
        let list = newlistifier.getList({text: getText()});
        expect(list).to.be.an('object');
      });
      it('object should have a list array', function() {
        let list = newlistifier.getList({text: getText()});
        expect(list.list).to.be.an('array');
        expect(list.list).to.have.length.above(0);
        expect(list.list[0]).to.be.a(`string`);
      });
      it('object should have metadata', function() {
        let list = newlistifier.getList({text: getText()});
        expect(list.metadata).to.be.an('object');
      });
    });

  });

}());
