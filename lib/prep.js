const linify = prefFn => (line, index) => {
  //   const prefix = `${index + 1}.`
  //   const prefFn = prefixifiers.number
  const revised = `<li>${prefFn(index)}${line}</li>`
  return revised
}

const prefixifiers = {
  number: (index) => `${index + 1}. `,
  bullet: _ => `&bull; `,
  dash: _ => `- `,
  none: _ => ``,
  diamond: _ => `$loz; `
}

// poem := list
const prepForPublish = (poem, pfxFn = prefixifiers.number) => {
  const data = JSON.parse(JSON.stringify(poem))
  const dataline = `<!-- config: ${JSON.stringify(data.metadata)} -->`
  const liner = linify(pfxFn)
  return `<ul>${data.list.map(liner).join(`\n`)}</ul>${dataline}`
}

module.exports = {
  prepForPublish,
  prefixifiers
}
