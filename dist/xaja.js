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
  if (typeof XMLHttpRequest !== 'function') {
    var _XMLHttpRequest = require('xmlhttprequest');
  }

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

  //checkJSON JSON -> {k:v}
  //checkJSON String -> Error
  var checkJSON = function checkJSON(json) {
    switch (true) {
      case typeof json !== 'string':
        return new Error('Invalid type ' + typeof json + ' in checkJSON');
      case json.length < 3:
        return new Error("Empty JSON response");
      default:
        return JSON.parse(json);
    }
  };

  return {
    get: function get(url, data, returnType) {
      return new Promise(function (resolve, reject) {
        var params = data == null ? '' : '?' + toURLString(data);
        if (params instanceof Error) {
          reject(params);
          return null;
        }
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url + params);
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
          reject(new Error("Network Error"));
          return null;
        };
        xhr.send();
        return null;
      });
    },
    post: function post(url, data, returnType) {
      return new Promise(function (resolve, reject) {
        var params = data == null ? '' : toURLString(data);
        if (params instanceof Error) {
          reject(params);
          return null;
        }
        var xhr = new XMLHttpRequest();
        xhr.open('POST', url);
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
          reject(new Error("Network Error"));
          return null;
        };
        xhr.send(params);
        return null;
      });
    },
    getJSON: function getJSON(url, data) {
      return this.get(url, data, 'json');
    }
  };
});
