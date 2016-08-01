(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', 'js-typed', 'decorators-js', 'utils'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('js-typed'), require('decorators-js'), require('utils'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.jsTyped, global.decoratorsJs, global.utils);
    global.xaja = mod.exports;
  }
})(this, function (exports, _jsTyped, _decoratorsJs, _utils) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.toURLString = exports.getJSON = exports.post = exports.get = undefined;

  var typed = _interopRequireWildcard(_jsTyped);

  var decor = _interopRequireWildcard(_decoratorsJs);

  var utils = _interopRequireWildcard(_utils);

  function _interopRequireWildcard(obj) {
    if (obj && obj.__esModule) {
      return obj;
    } else {
      var newObj = {};

      if (obj != null) {
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
        }
      }

      newObj.default = obj;
      return newObj;
    }
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

  //from https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding
  //note that btoa is IE 10+
  var base64Encode = typed.guard('string', function (str) {
    var bstring = encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
      return String.fromCharCode("0x" + p1);
    });

    return btoa(bstring);
  });

  //toURLString :: a -> String
  var toURLString = typed.Dispatcher([[['string'], function (str) {
    return encodeURIComponent(str);
  }], [['nil'], function () {
    return '';
  }], [['object'], function (a) {
    return Object.keys(a).map(function (k) {
      return encodeURIComponent(k) + '=' + encodeURIComponent(a[k]);
    }).join("&");
  }]]);

  var stripUserAndPass = typed.Dispatcher([[['nil'], function () {
    return [];
  }], [['object'], function (obj) {
    var keys = Object.keys(obj);
    var retObj = {},
        user = "",
        pass = "",
        authStr = "";
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
    if (user) {
      authStr = "Basic " + base64Encode(user + ":" + pass);
    }
    return [toURLString(retObj), authStr];
  }]]);

  typed.defType('__string+', function (s) {
    return s && typed.isType('string', s);
  });
  typed.sumType('__string|object', 'string', 'object');

  var get = typed.guard(1, ['__string+', '__string|object'], function (url, data) {
    var _ref = data ? stripUserAndPass(data) : [null, null];

    var _ref2 = _slicedToArray(_ref, 2);

    var params = _ref2[0];
    var authStr = _ref2[1];

    return new Promise(function (resolve, reject) {
      var path = url + (params ? '?' + params : '');
      var xhr = new XMLHttpRequest();
      xhr.open('GET', path);
      if (authStr) {
        xhr.setRequestHeader('Authorization', authStr);
      }
      xhr.onload = function () {
        if (xhr.status < 400 && xhr.status >= 200) {
          resolve(xhr.responseText);
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
  });

  var post = typed.guard(['__string+', 'object'], function (url, data) {
    var _stripUserAndPass = stripUserAndPass(data);

    var _stripUserAndPass2 = _slicedToArray(_stripUserAndPass, 2);

    var params = _stripUserAndPass2[0];
    var authStr = _stripUserAndPass2[1];

    return new Promise(function (resolve, reject) {
      var params = toURLString(data);
      var xhr = new XMLHttpRequest();
      xhr.open('POST', url);
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8");
      if (authStr) {
        xhr.setRequestHeader('Authorization', authStr);
      }
      xhr.onload = function () {
        if (xhr.status < 400 && xhr.status >= 200) {
          resolve(xhr.responseText);
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
      xhr.send(params);
      return null;
    });
  });

  var getJSON = function getJSON(url, data) {
    return utils.unpackJSON(data ? get(url, data) : get(url));
  };

  exports.get = get;
  exports.post = post;
  exports.getJSON = getJSON;
  exports.toURLString = toURLString;
});
