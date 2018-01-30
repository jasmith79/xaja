(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', '../node_modules/extracttype/extracttype.js'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('../node_modules/extracttype/extracttype.js'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.extracttype);
    global.xaja = mod.exports;
  }
})(this, function (exports, _extracttype) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.post = exports.getJSON = exports.get = exports.request = exports.fetchLoaded = exports.toURLString = undefined;

  var _extracttype2 = _interopRequireDefault(_extracttype);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var _slicedToArray = function () {
    function sliceIterator(arr, i) {
      var _arr = [];
      var _n = true;
      var _d = false;
      var _e = undefined;

      try {
        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);

          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"]) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }

      return _arr;
    }

    return function (arr, i) {
      if (Array.isArray(arr)) {
        return arr;
      } else if (Symbol.iterator in Object(arr)) {
        return sliceIterator(arr, i);
      } else {
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      }
    };
  }();

  var global = new Function('return this;')();
  var Promise = global.Promise,
      encodeURIComponent = global.encodeURIComponent,
      btoa = global.btoa,
      fetch = global.fetch,
      localStorage = global.localStorage,
      Error = global.Error,
      Object = global.Object,
      Request = global.Request;


  var base64Encode = function base64Encode(str) {
    var bstring = encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
      return String.fromCharCode("0x" + p1);
    });

    return btoa(bstring);
  };

  var extractUserAndPass = function extractUserAndPass(obj) {
    if (obj) {
      var _Object$entries$reduc = Object.entries(obj).reduce(function (_ref, _ref2) {
        var _ref4 = _slicedToArray(_ref, 2),
            usrpss = _ref4[0],
            o = _ref4[1];

        var _ref3 = _slicedToArray(_ref2, 2),
            k = _ref3[0],
            v = _ref3[1];

        if (k.match(/user/i)) {
          usrpss.user = v;
        } else if (k.match(/pass/i)) {
          usrpss.pass = v;
        } else {
          o[k] = v;
        }

        return [usrpss, o];
      }, [{}, {}]),
          _Object$entries$reduc2 = _slicedToArray(_Object$entries$reduc, 2),
          _Object$entries$reduc3 = _Object$entries$reduc2[0],
          user = _Object$entries$reduc3.user,
          pass = _Object$entries$reduc3.pass,
          rest = _Object$entries$reduc2[1];

      if (user && pass) {
        return ['Basic ' + base64Encode(user + ':' + pass), rest];
      }

      return [{}, rest];
    }

    return null;
  };

  var toURLString = exports.toURLString = function toURLString(arg) {
    switch ((0, _extracttype2.default)(arg)) {
      case 'Null':
      case 'Undefined':
        return '';

      case 'String':
        return encodeURIComponent(arg);

      default:
        return Object.entries(arg).map(function (_ref5) {
          var _ref6 = _slicedToArray(_ref5, 2),
              k = _ref6[0],
              v = _ref6[1];

          return encodeURIComponent(k) + '=' + encodeURIComponent(v);
        }).join('&');
    }
  };

  var fetchLoaded = exports.fetchLoaded = new Promise(function (resolve, reject) {
    if (!fetch) {
      var script = document.createElement('script');
      script.src = './node_modules/whatwg-fetch/fetch.js';
      script.onload = function (_) {
        resolve([global.fetch, global.Request]);
      };

      script.onerror = function (err) {
        reject(err);
      };

      global.document.head.appendChild(script);
    } else {
      resolve([global.fetch, global.Request]);
    }
  });

  var request = exports.request = function request(arg) {
    var url = arg.url,
        data = arg.data,
        _arg$method = arg.method,
        method = _arg$method === undefined ? 'GET' : _arg$method,
        responseType = arg.responseType,
        contentType = arg.contentType,
        _arg$timeout = arg.timeout,
        timeout = _arg$timeout === undefined ? 0 : _arg$timeout,
        cache = arg.cache,
        headers = arg.headers,
        _arg$credentials = arg.credentials,
        credentials = _arg$credentials === undefined ? 'same-origin' : _arg$credentials;


    if (!url) {
      if ((0, _extracttype2.default)(arg) === 'String') {
        url = arg;
      } else {
        return Promise.reject(new TypeError('HTTP request must include a url.'));
      }
    }

    if (!responseType) {
      var match = url.match(/\.(html|json|text|txt)$/);
      if (match) {
        responseType = match[1] === 'txt' ? 'text' : match[1];
      } else {
        responseType = 'text';
      }
    }

    var auth = void 0,
        body = void 0;
    if (data) {
      switch ((0, _extracttype2.default)(data)) {
        case 'String':
          contentType = contentType || 'text/plain;charset=UTF-8';
          body = data;
          break;

        case 'FormData':
          body = data;
          break;

        case 'Object':
          var _extractUserAndPass = extractUserAndPass(data),
              _extractUserAndPass2 = _slicedToArray(_extractUserAndPass, 2),
              a = _extractUserAndPass2[0],
              b = _extractUserAndPass2[1];

          auth = a;
          if (method.toUpperCase() === 'GET') {
            url = url + '?' + toURLString(b);
            contentType = contentType || 'application/x-www-form-urlencoded;charset=UTF-8';
          } else {
            body = new FormData();
            Object.entries(b).forEach(function (_ref7) {
              var _ref8 = _slicedToArray(_ref7, 2),
                  k = _ref8[0],
                  v = _ref8[1];

              body.append(k, v);
            });
          }

          break;

        default:
          body = data;
          break;
      }
    }

    var hdrs = headers || new Headers();

    if (auth && !hdrs.get('Authorization')) hdrs.set('Authorization', auth);
    if (contentType && !hdrs.get('Content-Type')) hdrs.set('Content-Type', contentType);

    var opts = {
      method: method,
      headers: hdrs,
      credentials: credentials
    };

    if (method.toUpperCase() !== 'GET') opts.body = body;
    if (method.toUpperCase() === 'POST' && !opts.body) opts.body = {};

    var req = new Request(url, opts);
    var p = fetchLoaded.then(function (_ref9) {
      var _ref10 = _slicedToArray(_ref9, 2),
          fetch = _ref10[0],
          Request = _ref10[1];

      return new Promise(function (resolve, reject) {
        var innerp = fetch(req).then(function (resp) {
          if (resp.status >= 200 && resp.status < 300) {
            return resp;
          } else {
            var err = new Error(resp.statusText);
            err.response = resp;
            var cached = localStorage.getItem(url);
            if (cached) {
              console.warn(err.message + ' resolving with cached data...');
              var resCached = function resCached() {
                return Promise.resolve(cached);
              };
              return {
                json: resCached,
                text: resCached,
                blob: resCached,
                arrayBuffer: resCached
              };
            } else {
              throw err;
            }
          }
        });

        if (timeout) {
          var handle = setTimeout(function () {
            var msg = 'Request for ' + url + ' reached timeout of ' + timeout + 'ms.';
            var cached = localStorage.getItem(url);
            if (cached) {
              console.warn(msg + ' resolving with cached data...');
              var resCached = function resCached() {
                return Promise.resolve(cached);
              };
              resolve({
                json: resCached,
                text: resCached,
                blob: resCached,
                arrayBuffer: resCached
              });
            } else {
              reject(new Error(msg));
            }
          }, timeout);

          innerp.then(function (resp) {
            global.clearTimeout(handle);
            resolve(resp);
          });
        } else {
          resolve(innerp);
        }
      });
    });
    p.request = req;

    var rt = responseType.toLowerCase();
    var promise = void 0;
    switch (rt) {
      case 'text':
      case 'html':
        promise = p.then(function (resp) {
          return resp.text();
        }).then(function (txt) {
          if (cache && method.toUpperCase() === 'GET') localStorage.setItem(url, txt);
          return txt;
        });

        Object.defineProperty(promise, 'request', { get: function get() {
            return p.request;
          } });
        return promise;

      case 'json':
        promise = p.then(function (resp) {
          return resp.json();
        }).then(function (json) {
          if (cache && method.toUpperCase() === 'GET') localStorage.setItem(url, json);
          return json;
        });

        Object.defineProperty(promise, 'request', { get: function get() {
            return p.request;
          } });
        return promise;

      case 'blob':
      case 'arrayBuffer':
        Object.defineProperty(promise, 'request', { get: function get() {
            return p.request;
          } });
        return p.then(function (resp) {
          return resp[rt]();
        });

      case 'stream':
      default:
        return p;
    }
  };

  var get = exports.get = function get(url, data) {
    var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    var conf = Object.entries(opts).reduce(function (acc, _ref11) {
      var _ref12 = _slicedToArray(_ref11, 2),
          k = _ref12[0],
          v = _ref12[1];

      return acc[k] = v, acc;
    }, {});
    conf.method = 'GET';
    conf.url = url;
    if (data) conf.data = data;
    return request(conf);
  };

  var getJSON = exports.getJSON = function getJSON(url, data) {
    var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    var conf = Object.entries(opts).reduce(function (acc, _ref13) {
      var _ref14 = _slicedToArray(_ref13, 2),
          k = _ref14[0],
          v = _ref14[1];

      return acc[k] = v, acc;
    }, {});
    conf.method = 'GET';
    conf.url = url;
    conf.responseType = 'json';
    if (data) conf.data = data;
    return request(conf);
  };

  var post = exports.post = function post(url, data) {
    var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    var conf = Object.entries(opts).reduce(function (acc, _ref15) {
      var _ref16 = _slicedToArray(_ref15, 2),
          k = _ref16[0],
          v = _ref16[1];

      return acc[k] = v, acc;
    }, {});
    conf.method = 'POST';
    conf.url = url;
    if (data) conf.data = data;
    return request(conf);
  };

  exports.default = request;
});
