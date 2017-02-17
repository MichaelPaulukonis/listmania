// Put your own Twitter App keys here. See README.md for more detail.
// if you see 'process.env.SOMETHING' that means it's a heroku environment variable
// heroku plugins:install https://github.com/ddollar/heroku-config.git
// and will only work with 'foreman start worker'
var config = function() {

  require(`dotenv`).config({silent: true}); // read .env file IF IT EXISTS - which only s/b DEV

  return {
    consumerKey:    process.env.consumer_key,
    consumerSecret: process.env.consumer_secret,
    accessToken:    process.env.token,
    accessSecret:   process.env.token_secret,

    postLive:       (process.env.post_live.toLowerCase() === `true`)
  };

}();

module.exports = config;
