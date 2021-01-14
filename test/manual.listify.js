const { prepForPublish, prefixifiers } = require('../lib/prep')

const x = {
  list: ['thing', 'thingy', 'apple', 'deltas', 'epix'],
  metadata: 'metadata'
}

Object.keys(prefixifiers).map(pfx => {
  console.log(prepForPublish(x, prefixifiers.pfx))
})
