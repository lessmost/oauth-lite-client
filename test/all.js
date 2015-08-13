var oauth1 = require("./helper/oauth1.js");
var oauth2 = require("./helper/oauth2.js");

oauth1('Dropbox', 'oauth1_dropbox.json');
oauth1('Kuaipan', 'oauth1_kuaipan.json');
oauth1('Twitter', 'oauth1_twitter.json');
oauth2('Dropbox', 'oauth2_dropbox.json');
oauth2('Google', 'oauth2_google.json');
