'use strict'

const textutils = function () {
  // would be nice to ignore some stop words
  // var stopwords = require(`./stopwords.js`)

  const splitwords = function (text) {
    // handle possible contractions http://stackoverflow.com/questions/27715581/how-do-i-handle-contractions-with-regex-word-boundaries-in-javascript
    return text.match(/(?!'.*')\b[\w']+\b/g)
  }

  // this is an awkward, annoying intermediate step
  const wordbag = function (text) {
    const wb = {}

    const splits = (Object.prototype.toString.call(text) === '[object Array]')
      ? text // if it's an array keep it
      : splitwords(text) // otherwise split it

    for (let i = 0, len = splits.length; i < len; i++) {
      const word = splits[i]
      // TODO: alphanumeric test should be optional
      // TODO: stop word should be part of util, and it's painful
      // if (stopwords.indexOf(word.toLowerCase()) == -1) {
      // if (alphanumeric.test(word) && word.length > 3) {
      const key = '_' + word.toUpperCase()
      if (!wb[key]) {
        wb[key] = { word: word, count: 0 }
      }
      wb[key].count++
    }

    return wb
  }

  const sortedArray = function (wordbag) {
    const words = Object.keys(wordbag).map(k => wordbag[k])
      .sort(function (a, b) {
        if (a.count < b.count) {
          return 1
        }

        if (a.count > b.count) {
          return -1
        }

        return 0
      })

    return words
  }

  const wordfreqs = function (text) {
    return sortedArray(wordbag(text))
  }

  // TODO: drop this into textutils AND TEST IT
  // based on some code I saw in https://github.com/scotthammack/ebook_ebooks/blob/master/ebook_ebooks.py
  // I've contemplated a different version for years, which I should complete
  // that would add in the missing pieces.
  const cleaner = function (poem) {
    // a first implementation of a naive cleaner
    const plines = poem.split('\n')

    const cleanlines = []

    for (let i = 0, len = plines.length; i < len; i++) {
      let line = plines[i]

      // multiple underscores to single
      line = line.replace(/_+/g, '_')

      // remove beginning and ending punctuation?
      // trouble is, this is used on sentences AND words
      // we want a word-level cleanup for one utility.... aaargh.

      const leftbrackets = line.match(/\[/g)

      const lbCount = (leftbrackets ? leftbrackets.length : 0)

      const rightbrackets = line.match(/\]/g)

      const rbCount = (rightbrackets ? rightbrackets.length : 0)

      if ((leftbrackets || rightbrackets) && lbCount !== rbCount) {
        line = line.replace(/[[\]]/g, '')
      }

      const leftparens = line.match(/\(/g)

      const lpCount = (leftparens ? leftparens.length : 0)

      const rightparens = line.match(/\)/g)

      const rpCount = (rightparens ? rightparens.length : 0)

      if ((leftparens || rightparens) && lpCount !== rpCount) {
        line = line.replace(/[()]/g, '')
      }

      cleanlines.push(line)
    }

    return cleanlines.join('\n')
  }

  const sentencify = function (text) {
    // if array of texts, join 'em together
    if (Object.prototype.toString.call(text) === '[object Array]') {
      text = text.reduce((p, c) => p + ' ' + c, '').trim()
    }

    const debreak = require('../lib/debreak.js')
    const nlp = require('compromise')

    const t = debreak(text)
      .replace(/\t/g, ' ')
      .replace(/^ +/g, '')

    const s = nlp(t).sentences().out('array')

    const sentences = s.sentences.map(s => s.str.trim())
    return sentences
  }

  return {
    wordbag: wordbag,
    wordfreqs: wordfreqs,
    cleaner: cleaner,
    splitwords: splitwords,
    sentencify: sentencify
  }
}

module.exports = textutils()
