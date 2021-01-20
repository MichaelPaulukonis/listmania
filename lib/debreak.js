'use strict'

// TODO: wrap this up as its own npm module

const altmethod = function (text) {
  const lines = text.split('\n')

  const newlines = []

  let curline = []

  for (let i = 0, lineslength = lines.length; i < lineslength; i++) {
    const line = lines[i].trim()
    if (line.length === 0) {
      newlines.push(curline.join('').trim())
      curline = []
    } else {
      // drop ending hyphen (NOTE: false loss 5% of time, [citation])
      const endsWithHyphen = (line.slice(line.length - 1) === '-')
      curline.push((endsWithHyphen ? line.slice(0, line.length - 1) : line + ' '))
      if (i === lineslength - 1) {
        newlines.push(curline.join('').trim())
      }
    }
  }

  return newlines
}

/**
 takes in multi-line, word-wrapped text
 returns paragraphs as single lines
 optionally set blank-lines between paragraphs
 **/
const debreak = function (text, config) {
  let cleanText
  if (config === undefined) {
    config = {
      lineArary: false
    }
  }

  // TODO: rename altmethod, since it's no longer an alternate
  cleanText = altmethod(text).join('\n')

  if (config.lineArray) {
    cleanText = cleanText.split('\n')
  }

  return cleanText
}

module.exports = debreak
