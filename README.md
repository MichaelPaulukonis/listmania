# listmania
maker of lists (that from a long way off look like flies)

automated output @ https://leanstooneside.tumblr.com/

# running
`node index.js`

```
  Usage: index [options]

  Options:

    -h, --help                    output usage information
    -V, --version                 output the version number
    -c, --corporaFilter [string]  filename substring filter (non-case sensitive)
    -p, --patternMatch [string]   nlp-compromise matchPattern for list elements
    -m, --method [string]         method-type [`matchStrats`, `posStrats`, `posStratAdjs`, `weirdStrats`, `patternStrats`]
```

`method` uses fuzzy matching, so `node index -m weird` will match up to `node index.js -m weirdStrats` etc.

