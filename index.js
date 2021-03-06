
/**
 * This is a constructor for a HttpProxyRules instance.
 * @param {Object} options Takes in a `rules` obj, (optional) `default` target
 */
function HttpProxyRules(options) {
  this.rules = options.rules;
  this.default = options.default || null;

  return this;
};

/**
 * This function will modify the `req` object if a match is found.
 * We also return the new endpoint string if a match is found.
 * @param  {Object} options Takes in a `req` object.
 * @return {Object} proxySettings
 */
HttpProxyRules.prototype.match = function match(req) {
  var rules = this.rules;
  var path = req.url;
  var proxySettings = {
    target: this.default
  };

  // go through the proxy rules, assuming keys (path prefixes) are ordered
  // and pick the first target whose path prefix is a prefix of the
  // request url path. RegExp enabled.
  var pathPrefixRegexp;
  var testPrefixMatch;
  var urlPrefix;
  var pathEndsWithSlash;
  for (var pathPrefix in rules) {
    var rule = rules[pathPrefix];
    var ruleIsAnObject = typeof rule === 'object';

    if (rules.hasOwnProperty(pathPrefix)) {
      if (pathPrefix[pathPrefix.length - 1] === '/') {
        pathPrefixRegexp = new RegExp(pathPrefix);
        pathEndsWithSlash = true;
      } else {
        // match '/test' or '/test/' or './test?' but not '/testing'
        pathPrefixRegexp = new RegExp('(' + pathPrefix + ')' + '(?:\\W|$)');
        pathEndsWithSlash = false;
      }

      testPrefixMatch = pathPrefixRegexp.exec(path);
      if (testPrefixMatch && testPrefixMatch.index === 0) {
        if(ruleIsAnObject){
          rule = Object.assign({}, rule);

          if(rules[pathPrefix].removePrefix){
            urlPrefix = pathEndsWithSlash ? testPrefixMatch[0] : testPrefixMatch[1];
            rule.target += path.replace(urlPrefix, '');
          }
          proxySettings = rule;

        } else {
          proxySettings.target = rule;
        }
        break;
      }
    }
  }

  return proxySettings;
}

module.exports = HttpProxyRules;
