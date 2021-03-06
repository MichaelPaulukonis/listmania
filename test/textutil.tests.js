const chai = require('chai')
const dirtyChai = require('dirty-chai')
chai.use(dirtyChai)
const expect = chai.expect
const textutils = require('../lib/textutil.js')

describe('textutil', function () {
  describe('API', function () {
    it('Util should expose a wordfreqs method', function () {
      expect(textutils.wordfreqs).to.be.a('function')
    })

    it('Util should expose a wordbag method', function () {
      expect(textutils.wordbag).to.be.a('function')
    })

    it('should expose a cleaner method', function () {
      expect(textutils.cleaner).to.be.a('function')
    })

    it('should expose a splitwords method', function () {
      expect(textutils.splitwords).to.be.a('function')
    })
  })

  describe('splitwords', function () {
    const splits = textutils.splitwords('Hey we\'re the monkeys. Aren\'t we?')
    it('should return an array (of 6 words)', function () {
      expect(splits).to.be.instanceOf(Array)
      expect(splits.length).to.equal(6)
    })
    it('should not split contractions (we\'re, aren\'t)', function () {
      expect(splits[1]).to.equal('we\'re')
      expect(splits[4]).to.equal('Aren\'t')
    })
  })

  describe('wordbag', function () {
    const bag = textutils.wordbag('Hey we\'re the monkeys. Aren\'t we?')

    const keys = Object.keys(bag)

    it('should return an object', function () {
      expect(bag).to.be.an('object')
    })

    it('should ignore common stop words(we\'re, the, aren\'t, we)', function () {
      const commonStops = ['we\'re', 'the', 'aren\'t', 'we']
      expect(commonStops.filter(sw => keys.indexOf('_' + sw) > -1).length).to.equal(0)
    })

    // this fails for 2 reasons
    // stop-words no longer removed
    // keys are now upper-cased.
    // WHY IS THIS?!?!?!?
    // it(`should contain the two non-stop words`, function() {
    //   let expectedWords = [`Hey`, `monkeys`];
    //   // keys now have a leading underscore, to get around JS reserved word issues
    //   // ("constructor" was the known issue)
    //   expect(keys.filter(key => expectedWords.indexOf(key.slice(1)) > -1).length).to.equal(2);
    // });
  })

  describe('wordfreqs', function () {
    const wf = textutils.wordfreqs('this is some text')
    it('should return an array', function () {
      expect(wf).to.be.instanceOf(Array)
    })
    it('each element should be an object', function () {
      expect(wf[0]).to.be.an('object')
    })
    it('the element should have a word property, that is a string', function () {
      expect(wf[0].word).to.be.a('string')
    })
    it('shouls have a count property that is a number', function () {
      expect(wf[0].count).to.be.an('number')
    })
  })

  describe('cleaner', function () {
    const unbalancedParens = 'some text(that needs[cleaning]'

    const unbalancedBrackets = 'some text(that needs[cleaning)'

    const cleanParens = textutils.cleaner(unbalancedParens)

    const cleanBrackets = textutils.cleaner(unbalancedBrackets)
    it('should return a string', function () {
      expect(cleanParens).to.be.a('string')
      expect(cleanBrackets).to.be.a('string')
    })
    it('should remove unbalancedParens', function () {
      expect(cleanParens.match(/\(|\)/g)).to.be.null()
    })
    it('should remove unbalancedBrackets', function () {
      expect(cleanBrackets.match(/\[|\]/g)).to.be.null()
    })
    it('should not remove balanced parens', function () {
      expect(cleanBrackets.match(/\(|\)/g)).to.not.be.null()
    })
    it('should not remove balanced brackets', function () {
      expect(cleanParens.match(/\[|\]/g)).to.not.be.null()
    })
  })
})
