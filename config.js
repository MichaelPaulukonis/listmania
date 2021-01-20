require('dotenv').config() // read .env file IF IT EXISTS - which only s/b DEV

const config = {
  consumerKey: process.env.consumer_key,
  consumerSecret: process.env.consumer_secret,
  accessToken: process.env.token,
  accessSecret: process.env.token_secret,

  postLive: ((process.env.post_live || '').toLowerCase() === 'true')
}

module.exports = config
