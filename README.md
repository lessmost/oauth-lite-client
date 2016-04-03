# oauth-lite-client

Another lite OAuth client in Node.JS provide OAuth version 1 and version 2 
support.

Thanks to [Request](https://github.com/request/request), it makes this client
flexible and easy to use.

Already tested service providers list:

- OAuth version 1: Dropbox, Twitter, Kuaipan
- OAuth version 2: Google, Dropbox, Github

# How to use

1. new the client with options, for all accepted options please refer to the comment

    ```js
    var OAuth = require('oauth-lite-client');
    
    var client1 = new OAuth.OAuth1({
        consumer_key: 'yourappkey',
        consumer_secret: 'yourappsecret',
        callback: 'redirecturl',
        request_token_url: "https://api.dropbox.com/1/oauth/request_token",
        access_token_url: "https://api.dropbox.com/1/oauth/access_token",
        authorize_url: "https://www.dropbox.com/1/oauth/authorize",
        account_info_url: "https://api.dropbox.com/1/account/info",
        transport_method: 'header or query or body'
    });
    var client2 = new OAuth.OAuth2({
        client_id: 'yourclientid',
        client_secret: 'yourclientsecre',
        callback: 'redirecturl',
        token_url: "https://api.dropbox.com/1/oauth2/token",
        authorize_url: "https://www.dropbox.com/1/oauth2/authorize",
        account_info_url: "https://api.dropbox.com/1/account/info",
    });
    ```

2. get the authorize url for redirect

    ```js
    client.getAuthorizeUrl(function(err, url) {
        // redirect to the returned url
        // after user grant acess authorize, get the following parameter from query string
        // for OAuth1: oauth_token, oauth_verfiier
        // for OAuth2: code
    });
    ```

3. get the token

    ```js
    // after get the oauth_token or code from step 2, we can call token function
    client.token({
                    code: 'code from step 2', // for OAuth 2
                    oauth_token: 'oauth_token from step 2' // for OAuth 1
                },function (err, res, body) {
        // for OAuth 1, body contains oauth_token and oauth_token_secret
        var token = body.oauth_token;
        var tokenSecret = body.oauth_token_secret;
        
        // for OAuth 2, body contains access_token and optional refresh_token
        var accessToken = body.access_token;
        var refreshToken = body.refresh_token;
    });  
    ```

4. get the user profile

    ```js
    // after get the token, we can call accountInfo to get user profile
    client.accountInfo(function (err, res, body) {
        // The response body vary for different source providers
        // we may get user name or email from the body
        var res = JSON.parse(body);
    });
    ```

5. call service provider's API

    ```js
    // after get the token, we can call request function to get any source
    // provider's API endpoint
    client.request({
       // get user's Dropbox files metadata information
       url: 'https://api.dropbox.com/1/metadata/auto/'
    }, function (err, res, body) {
       // parse body..
    });
    ```

# How to test

Before run the unit test, we need to create OAuth app in the source provider, and
get the OAuth paramters and set them in `test/config` JSON files.

Then run `npm test` to test against all the test case defined in `test/all.js`.

The current test process is a not automatable unit test, it need user to visit
the authorize url and copy the token or code to test script.

How to add another source provider test case:

* Add an configuration file in `test/config` directory, define the app OAuth
parameter and API endpoint
* Add the test entry in `test/all.js` and run `npm test`

# Todo

Test against more source providers.