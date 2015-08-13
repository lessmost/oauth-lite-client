var request = require("request");
var URL = require("url");

/**
 * OAuth version 2 client class
 * 
 * @constructor
 * @param {Object} options - The options to new the client
 * @param {string} options.client_id - The client id of your App
 * @param {string} options.client_secret - The client secret of your App
 * @param {string} [options.redirect_url] - One of your App regesited redirect
 * url
 * @param {string} options.authorize_url - The base authorzation url
 * @param {string} options.token_url - The url to get token
 * @param {string} [options.account_info_url] - The url to get user profile
 * @param {string} [options.account_info_method=GET] - The http method when get
 * user profile
 */ 
function OAuth2(options) {
    this.options = options;
    /**
     * Collections of OAuth tokens
     * @type {Object}
     */
    this.tokens = {};
}

/**
 * Get the authorization url for user to authroze access
 * @param {Object} [options] - The additional options when get authorzation url
 * @param {string} [options.scope] - The OAuth2 scope parameter
 * @param {OAuth2~getAuthorizeUrlCallback} callback - The callback to hanle the
 * url
 */
OAuth2.prototype.getAuthorizeUrl = function getAuthorizeUrl(options, callback) {
    var res;
    if (callback === undefined) {
        callback = options;
        options = {};
    }
    options.client_id = this.options.client_id;
    if (this.options.redirect_uri) {
        options.redirect_uri = this.options.redirect_uri;
    }
    options.response_type = options.response_type || this.options.response_type || 'code';

    res = URL.parse(options.authorize_url || this.options.authorize_url, true);
    delete res.search;
    res.query = res.query || {};
    for (var key in options) {
        res.query[key] = options[key];
    }

    callback(null, URL.format(res));
};

/**
 * Get the access token and/or refresh token
 * @param {Object} [options] - The oauth options when issue request
 * to get access token
 * @param {string} [options.code] - The authrozation code returned from provider
 * service when callback url is visited
 * @param {OAuth2~requestCallback} callback - The callback function to handle
 * result
 */
OAuth2.prototype.token = function token(options, callback) {
    var me = this;
    
    if (callback === undefined) {
        callback = options;
        options = {};
    }
    request({
        url: this.options.token_url,
        method: 'POST',
        form: {
            code: options.code,
            grant_type: 'authorization_code',
            client_id: this.options.client_id,
            client_secret: this.options.client_secret,
            redirect_uri: this.options.redirect_uri
        }
    }, function(err, res, body) {
        if (err || res.statusCode !== 200) {
            callback(err, res, body);
        }
        else {
            body = JSON.parse(body);
            
            if (body.access_token) {
                me.tokens.token_type = body.token_type || 'Bearer';
                me.tokens.access_token = body.access_token;
                if (body.refresh_token) {
                    me.tokens.refresh_token = body.refresh_token;
                }
                callback(null, res, body);
            } else {
                callback(new Error('no token returned'), null, null);
            }
        }
    });
};

/**
 * Get user account/profile information
 * @param {OAuth2~requestCallback} callback
 */
OAuth2.prototype.accountInfo = function accountInfo(callback) {
    var me = this;
    var options;
    if (!me.options.account_info_url) {
        callback(new Error('no account_info_url provided'));
        return;
    }
    options = {
        url: me.options.account_info_url,
        method: me.options.account_info_method || 'GET'
    };
    if (me.tokens.access_token) {
        options.auth = {
            bearer: me.tokens.access_token
        };
    }
    request(options, callback);
};

/**
 * Request service provider api after authorized
 * @param {Object} options - options object pass to Request module:
 * {@link https://github.com/request/request#requestoptions-callback|Request Options}
 * options.oauth will be provided by this module
 * @param {OAuth2~requestCallback} callback
 */
OAuth2.prototype.request = function (options, callback) {
    if (this.tokens.access_token) {
        options.auth = {
            bearer: this.tokens.access_token
        };
    }
    request(options, callback);
};

/**
 * Callback used for Request function
 * @callback OAuth2~requestCallback
 * @param {Error} err
 * @param {Object} response
 * @param {Object|string} body
 */
 
/**
 * Callback for getAuthorizeUrl
 * @callback OAuth2~getAuthorizeUrlCallback
 * @param {Error} err
 * @param {string} url - authorize url
 */ 

/**
 * OAuth version 2 module
 * @module
 */ 
module.exports = OAuth2;
