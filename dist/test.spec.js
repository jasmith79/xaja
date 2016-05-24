(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['xaja'], factory);
  } else if (typeof exports !== "undefined") {
    factory(require('xaja'));
  } else {
    var mod = {
      exports: {}
    };
    factory(global.xaja);
    global.test = mod.exports;
  }
})(this, function (_xaja) {
  'use strict';

  var xaja = _interopRequireWildcard(_xaja);

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

  describe('get', function () {
    it('should xhr in a request', function (done) {
      xaja.get('./spec/test.txt').then(function (x) {
        expect(x).toBe('Received');
        done();
      }).catch(function (e) {
        expect(e.message).toBe('ignore');
        done();
      });
    });

    it('should be able to pass data with a get req.', function (done) {
      xaja.get('testrest', { chew: 'fat' }).then(function (x) {
        expect(x).toBe('chew:fat');
        done();
      }).catch(function (e) {
        expect(e.message).toBe('ignore');
        done();
      });
    });

    it('should throw on wrong args', function () {
      expect(function () {
        return xaja.get('./spec/test.txt', 3);
      }).toThrow();
    });
  });

  describe('post', function () {
    it('should be able to post data', function (done) {
      xaja.post('testrest', { string: 'immastring' }).then(function (x) {
        expect(x).toBe('string=immastring');
        done();
      }).catch(function (e) {
        expect(e.message).toBe('ignore');
        done();
      });
    });

    it('should throw on wrong or missing args', function () {
      expect(function () {
        return xaja.post('testrest', []);
      }).toThrow();
    });
  });

  describe('getJSON', function () {
    it('should fetch and parse json', function (done) {
      xaja.getJSON('./spec/test.json').then(function (x) {
        expect(x.ya).toBe('hoo');
        done();
      }).catch(function (e) {
        expect(e.message).toBe('ignore');
        done();
      });
    });

    it('should reject on an invalid json string', function (done) {
      xaja.getJSON('./spec/test.txt').then(function () {
        throw new Error('Should not see me');
      }).catch(function (e) {
        expect(e.message).toBe('Expected JSONString, got string');
        done();
      });
    });
  });
});
