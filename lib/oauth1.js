var URL = require("url");
var qs = require("querystring");
var request = require("request");

/**
 * Helper function to parse response body
 * 
 * @param {string} body
 * @private
 */ 
function parseBody(body) {
    var res;
    try {
        res = JSON.parse(body);
    }
    catch (e) {
        res = qs.parse(body);
    }
    return res;
}


/**
 * OAuth version 1 client class
 * 
 * @constructor
 * @param {Object} options - The options to create the client
 * @param {string} options.consumer_key - The consumer key of your App
 * @param {string} options.consumer_secret - The consumer secret of your App
 * @param {string} [options.callback] - The callback url of your App
 * @param {string} options.request_token_url - The url to get request token
 * @param {string} [options.request_token_method=GET] - The http method when get
 * request token
 * @param {string} options.authorize_url - The base url when redirect to ask for
 * user authorize
 * @param {string} options.access_token_url - The url to get access token
 * @param {string} [options.access_token_method=GET] - The http method when get
 * access token
 * @param {string} [options.token] - The exist token for reuse
 * @param {string} [options.token_secret] - The exist token secret for reuse
 * @param {string} [options.transport_method] - The method to send OAuth
 * parameters pass to request oauth object
 * @param {string} [options.signature_method] - The signing algorithm pass to
 * request oauth object
 * @param {string|boolean} [options.body_hash] - The body_hash parameter pass to
 * request oauth object
 */ 
function OAuth1(options) {
    var oauth = {
        consumer_key: options.consumer_key,
        consumer_secret: options.consumer_secret
    };
    if (options.callback) {
        oauth.callback = options.callback;
    }
    if (options.token) {
        oauth.token = options.token;
    }
    if (options.token_secret) {
        oauth.token_secret = options.token_secret;
    }
    if (options.transport_method) {
        oauth.transport_method = options.transport_method;
    }
    if (options.signature_method) {
        oauth.signature_method = options.signature_method;
    }
    if (options.body_hash !== undefined) {
        oauth.body_hash = options.body_hash;
    }

    this.options = options;
    /**
     * Collection of OAuth tokens
     * @type {Object}
     */
    this.oauth = oauth;
}

/**
 * Get a request token
 * @param {OAuth1~requestCallback} callback - The callback function to handle
 * response
 */ 
OAuth1.prototype.requestToken = function requestToken(callback) {
    var me = this;
    delete me.oauth['token'];
    delete me.oauth['token_secret'];
    request({
        url: me.options.request_token_url,
        method: me.options.request_token_method || 'GET',
        oauth: me.oauth
    }, function(err, res, body) {
        if (err || res.statusCode !== 200) {
            callback(err, res, body);
        }
        else {
            body = parseBody(body);
            me.oauth.token = body.oauth_token;
            me.oauth.token_secret = body.oauth_token_secret;
            callback(err, res, body);
        }
    });
};

/**
 * Get the authorization url for user to authroze access
 * @param {OAuth1~getAuthorizeUrlCallback} callback - The callback to hanle the
 * url
 */
OAuth1.prototype.getAuthorizeUrl = function getAuthorizeUrl(callback) {
    var me = this;
    me.requestToken(function(err, res, body) {
        var base;
        if (err || res.statusCode !== 200) {
            callback(err, res, body);
        }
        else {
            base = URL.parse(me.options.authorize_url, true);
            delete base.search;
            base.query = base.query || {};
            base.query.oauth_token = me.oauth.token;
            callback(null, URL.format(base));
        }
    });
};

/**
 * Get the access token and/or refresh token
 * @param {Object} [options] - The additional oauth options when issue request
 * to get access token
 * @param {string} [options.oauth_token] - The temp token returned from provider
 * service when callback url is visited
 * @param {string} [options.oauth_verifier] - The verifier returned from
 * provider when callback url is visited
 * @param {OAuth1~requestCallback} callback - The callback function to handle
 * result
 */
OAuth1.prototype.token = function token(options, callback) {
    var me = this;

    if (callback === undefined) {
        callback = options;
        options = {};
    }
    options = options || {};
    if (options.oauth_token) {
        me.oauth.token = options.oauth_token;
    }
    if (options.oauth_verifier) {
        me.oauth.verifier = options.oauth_verifier;
    }
    request({
        url: me.options.access_token_url,
        method: me.options.access_token_method || 'GET',
        oauth: me.oauth
    }, function(err, res, body) {
        if (err || res.statusCode !== 200) {
            callback(err, res, body);
        }
        else {
            body = parseBody(body);
            me.oauth.token = body.oauth_token;
            me.oauth.token_secret = body.oauth_token_secret;
            callback(err, res, body);
        }
    });
};

/**
 * Get user account/profile information
 * @param {OAuth1~requestCallback} callback
 */
OAuth1.prototype.accountInfo = function accountInfo(callback) {
    var me = this;
    if (!me.options.account_info_url) {
        callback(new Error('no account_info_url provided'));
        return;
    }
    request({
        url: me.options.account_info_url,
        method: me.options.account_info_method || 'GET',
        oauth: me.oauth
    }, callback);
};

/**
 * Request service provider api after authorized
 * @param {Object} options - options object pass to Request module:
 * {@link https://github.com/request/request#requestoptions-callback|Request Options}
 * options.oauth will be provided by this module
 * @param {OAuth1~requestCallback} callback
 */
OAuth1.prototype.request = function (options, callback) {
    var me = this;

    options.oauth = me.oauth;
    request(options, callback);
};

/**
 * Callback used for Request function
 * @callback OAuth1~requestCallback
 * @param {Error} err
 * @param {Object} response
 * @param {Object|string} body
 */
 
/**
 * Callback for getAuthorizeUrl
 * @callback OAuth1~getAuthorizeUrlCallback
 * @param {Error} err
 * @param {string} url - authorize url
 */ 

/**
 * OAuth version 1 module
 * @module
 */ 
module.exports = OAuth1;
