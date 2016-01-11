;(function (root, main) {
  var MOD_NAME = 'xaja';
  switch (true) {
    case typeof module === 'object' && module.exports != null:
      module.exports = main(root);break;
    case typeof define === 'function' && define.amd:
      define(main(root));break;
    default:
      root[MOD_NAME] = main(root);break;
  }
})(window ? window : null, function (_global) {
  'use strict';
  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

  if (typeof XMLHttpRequest !== 'function') {
    var _XMLHttpRequest = require('xmlhttprequest');
  }

  var noURLError = new Error("Invalid url");
  var emptyJSONError = new Error("Empty JSON response");
  var networkError = new Error("Network Error");

  //toURLString :: a -> String
  var toURLString = function toURLString(a) {
    var type = typeof a;
    switch (type) {
      case 'string':
        return a;
      case 'object':
        return a === null ? '' : Object.keys(a).map(function (k) {
          return encodeURIComponent(k) + '=' + encodeURIComponent(a[k]);
        }).join('&');
      default:
        return new Error(type + ' is not a valid ajax parameter');
    }
  };

  //stripUserAndPass :: {k:v} -> [String]
  //stripUserAndPass :: Null -> []
  var stripUserAndPass = function stripUserAndPass(obj) {
    if (obj == null) {
      return [];
    }
    var keys = Object.keys(obj);
    var retObj = {},
        user = "",
        pass = "";
    keys.forEach(function (k) {
      var val = obj[k];
      if (k.match(/user/i)) {
        user = val;
      } else if (k.match(/pass/i)) {
        pass = val;
      } else {
        retObj[k] = val;
      }
    });
    return [toURLString(retObj), user, pass];
  };

  //checkJSON JSON -> {k:v}
  //checkJSON String -> Error
  var checkJSON = function checkJSON(json) {
    switch (true) {
      case typeof json !== 'string':
        return new Error('Invalid type ' + typeof json + ' in checkJSON');
      case json.length < 3:
        return emptyJSONError;
      default:
        return JSON.parse(json);
    }
  };

  return {
    get: function get(url, data, returnType) {
      if (typeof url !== 'string' || !url.length) {
        return promise.reject(noURLError);
      }

      var _stripUserAndPass = stripUserAndPass(data);

      var _stripUserAndPass2 = _slicedToArray(_stripUserAndPass, 3);

      params = _stripUserAndPass2[0];
      user = _stripUserAndPass2[1];
      pass = _stripUserAndPass2[2];

      return new Promise(function (resolve, reject) {
        if (params instanceof Error) {
          reject(params);
          return null;
        }
        var path = params == null ? url : url + '?' + params;
        var arr = ['GET', path, true];
        if (user != null) {
          arr.push(user);
          if (pass != null) {
            arr.push(pass);
          }
        }
        var xhr = new XMLHttpRequest();
        xhr.open.apply(xhr, arr);
        xhr.onload = function () {
          if (xhr.status < 400 && xhr.status >= 200) {
            if (typeof returnType === 'string' && returnType.toLowerCase() === 'json') {
              var _data = checkJSON(xhr.responseText);
              if (_data instanceof Error) {
                reject(_data);
              } else {
                resolve(_data);
              }
              return null;
            } else {
              resolve(xhr.responseText);
            }
            return null;
          } else {
            reject(new Error('Server responded with a status of ' + xhr.status));
            return null;
          }
        };
        xhr.onerror = function () {
          reject(networkError);
          return null;
        };
        xhr.send();
        return null;
      });
    },
    post: function post(url, data, returnType) {
      if (typeof url !== 'string' || !url.length) {
        return promise.reject(noURLError);
      }

      var _stripUserAndPass3 = stripUserAndPass(data);

      var _stripUserAndPass32 = _slicedToArray(_stripUserAndPass3, 3);

      params = _stripUserAndPass32[0];
      user = _stripUserAndPass32[1];
      pass = _stripUserAndPass32[2];

      return new Promise(function (resolve, reject) {
        var params = data == null ? '' : toURLString(data);
        if (params instanceof Error) {
          reject(params);
          return null;
        }
        var arr = ['POST', url, true];
        if (user != null) {
          arr.push(user);
          if (pass != null) {
            arr.push(pass);
          }
        }
        var xhr = new XMLHttpRequest();
        xhr.open.apply(xhr, arr);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=UTF-8');
        xhr.onload = function () {
          if (xhr.status < 400 && xhr.status >= 200) {
            if (typeof returnType === 'string' && returnType.toLowerCase() === 'json') {
              var _data2 = checkJSON(xhr.responseText);
              if (_data2 instanceof Error) {
                reject(_data2);
              } else {
                resolve(_data2);
              }
              return null;
            } else {
              resolve(xhr.responseText);
            }
            return null;
          } else {
            reject(new Error('Server responded with a status of ' + xhr.status));
            return null;
          }
        };
        xhr.onerror = function () {
          reject(networkError);
          return null;
        };
        xhr.send(params || null);
        return null;
      });
    },
    getJSON: function getJSON(url, data) {
      return this.get(url, data, 'json');
    }
  };
});
