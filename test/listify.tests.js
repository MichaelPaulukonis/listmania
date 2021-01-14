const expect = require(`chai`).expect
const Listifier = require(`../lib/listify`)
const newlistifier = new Listifier()
let Corpora = require(`common-corpus`)

// for functional tests
const getText = function () {
  let corpora = new Corpora()
  let source = corpora.texts
  let textObj = source[2]
  // eh..... source[0] takes about 9 seconds to process into sentences....
  // "ideally", we should have some text blob that we know the results of
  // and not be dependent upon the common-corpus (mainly)
  // although I guess we _should_ test that for integration, since it's a component
  // but coding up a test based on indexes of an external package is problematic

  let blob = textObj.text()

  return {
    text: blob,
    source: textObj.name
  }
}

describe(`listifier`, function () {
  describe(`API`, function () {
    it(`returns a new instance with new`, function () {
      expect(newlistifier).to.be.a(`object`)
      expect(newlistifier).to.be.an.instanceof(Listifier)
    })

    it(`returns a new instance even without new`, function () {
      var listifier = Listifier()
      expect(listifier).to.be.a(`object`)
      expect(listifier).to.be.an.instanceof(Listifier)
    })

    it(`exposes a getList method`, function () {
      expect(newlistifier.getList).to.be.a(`function`)
    })
  })

  describe(`functional tests`, function () {
    let list = newlistifier.getList({ text: getText() })
    it(`returns an object`, function () {
      expect(list).to.be.an(`object`)
    })
    describe(`that has a list`, function () {
      it(`which is an array`, function () {
        expect(list.list).to.be.an(`array`)
      })
      // NOTE: as it currently stands, the lib will sometimes return an empty list
      // if the match is not found, for example
      // so... need some better way of testing/noting this
      // since it's a valid return case
      it(`having zero or non-zero length`, function () {
        expect(list.list).to.have.length.above(-1)
      })
      it(`and contain strings (or nothing)`, function () {
        // if list.list has elements, they are all strings
        // OR it does not have elements
        expect(list.list.filter(e => typeof e === `string`)).to.have.length(list.list.length)
      })
    })
    describe(`that has metadata`, function () {
      // TODO: test for specific meta-data items
      // will become important as we pass in paramas and expect certain results
      it(`which is an object`, function () {
        expect(list.metadata).to.be.an(`object`)
      })
      let md = list.metadata
      describe(`metadata properties`, function () {
        // TODO: this might be optional, if generated from data, not text?
        // but for now, source blob is provided BEFORE generation method is "known"
        // (leaving parameters aside)
        it(`has a source property`, function () {
          expect(md.source).to.be.a(`string`)
        })
        it(`has a strategy property`, function () {
          expect(md.strategy).to.be.a(`string`)
        })
        it(`has a title property`, function () {
          expect(md.title).to.be.a(`string`)
        })
        // this is a silly/stupid/poorly-named property
        // and replicates the length of the array
        // was created purely for convenience
        it(`has a length property`, function () {
          expect(md[`length`]).to.be.an(`number`)
        })
      })
    })
  })
})
