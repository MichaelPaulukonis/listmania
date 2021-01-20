const linify = prefFn => (line, index) => {
  const revised = `<div class='item'>${prefFn(index)}${line}</div>`

  return revised
}

const prefixifiers = {
  number: (index) => `${index + 1}. `,
  bullet: _ => `&bull; `,
  dash: _ => `- `,
  none: _ => ``,
  diamond: _ => `&loz; `
}

const prepForPublish = (list, pfxFn = prefixifiers.number) => {
  const data = JSON.parse(JSON.stringify(list))
  const dataline = `<!-- config: ${JSON.stringify(data.metadata)} -->`
  const liner = linify(pfxFn)
  return `<div class='list'>${data.list.map(liner).join(`\n`)}</div>${dataline}`
}

module.exports = {
  prepForPublish,
  prefixifiers
}
