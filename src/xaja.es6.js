;((root, main) => {
  const MOD_NAME = 'xaja'
  switch (true) {
    case typeof module === 'object' && module.exports != null: module.exports = main(root); break;
    case typeof define === 'function' && define.amd: define(main(root)); break;
    default: root[MOD_NAME] = main(root); break;
  }
})(window ? window : null, _global => {
  if (typeof XMLHttpRequest !== 'function') {
    const XMLHttpRequest = require('xmlhttprequest');
  }

  const noURLError     = new Error("Invalid url");
  const emptyJSONError = new Error("Empty JSON response");
  const networkError   = new Error("Network Error");

  //toURLString :: a -> String
  const toURLString = a => {
    const type = typeof a
    switch (type) {
      case 'string': return a;
      case 'object':
        return a === null ? '' :
          Object.keys(a)
            .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(a[k])}`)
            .join('&');
      default: return new Error(`${type} is not a valid ajax parameter`);
    }
  };

  //stripUserAndPass :: {k:v} -> [String]
  //stripUserAndPass :: Null -> []
  const stripUserAndPass = obj => {
    if (obj == null) {
      return [];
    }
    const keys = Object.keys(obj);
    let retObj = {}, user = "", pass = "";
    keys.forEach(k => {
      let val = obj[k];
      if (k.match(/user/i)) {
        user = val;
      } else if (k.match(/pass/i)) {
        pass = val;
      } else {
        retObj[k] = val;
      }
    });
    return [toURLString(retObj), user, pass];
  }

  //checkJSON JSON -> {k:v}
  //checkJSON String -> Error
  const checkJSON = (json) => {
    switch (true) {
      case typeof json !== 'string': return new Error(`Invalid type ${typeof json} in checkJSON`);
      case json.length < 3: return emptyJSONError;
      default: return JSON.parse(json);
    }
  };

  return {
    get: (url, data, returnType) => {
      if (typeof url !== 'string' || !url.length) {
        return promise.reject(noURLError);
      }
      [params, user, pass] = stripUserAndPass(data);
      return new Promise((resolve, reject) => {
        if (params instanceof Error) {
          reject(params);
          return null;
        }
        const path = params == null ? url : url + '?' + params;
        let arr = ['GET', path, true];
        if (user != null) {
          arr.push(user);
          if (pass != null) {
            arr.push(pass);
          }
        }
        const xhr = new XMLHttpRequest();
        xhr.open.apply(xhr, arr);
        xhr.onload = () => {
          if (xhr.status < 400 && xhr.status >= 200) {
            if (typeof returnType === 'string' && returnType.toLowerCase() === 'json') {
              const data = checkJSON(xhr.responseText);
              if (data instanceof Error) {
                reject(data);
              } else {
                resolve(data);
              }
              return null;
            } else {
              resolve(xhr.responseText);
            }
            return null;
          } else {
            reject(new Error(`Server responded with a status of ${xhr.status}`));
            return null;
          }
        };
        xhr.onerror = () => {
          reject(networkError);
          return null;
        }
        xhr.send();
        return null;
      });
    },
    post: (url, data, returnType) => {
      if (typeof url !== 'string' || !url.length) {
        return promise.reject(noURLError);
      }
      [params, user, pass] = stripUserAndPass(data);
      return new Promise((resolve, reject) => {
        const params = data == null ? '' : toURLString(data);
        if (params instanceof Error) {
          reject(params);
          return null;
        }
        let arr = ['POST', url, true];
        if (user != null) {
          arr.push(user);
          if (pass != null) {
            arr.push(pass);
          }
        }
        const xhr = new XMLHttpRequest();
        xhr.open.apply(xhr, arr);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=UTF-8');
        xhr.onload = () => {
          if (xhr.status < 400 && xhr.status >= 200) {
            if (typeof returnType === 'string' && returnType.toLowerCase() === 'json') {
              const data = checkJSON(xhr.responseText);
              if (data instanceof Error) {
                reject(data);
              } else {
                resolve(data);
              }
              return null;
            } else {
              resolve(xhr.responseText);
            }
            return null;
          } else {
            reject(new Error(`Server responded with a status of ${xhr.status}`));
            return null;
          }
        };
        xhr.onerror = () => {
          reject(networkError);
          return null;
        }
        xhr.send(params || null);
        return null;
      });
    },
    getJSON: function(url, data) {
      return this.get(url, data, 'json');
    },
  };
});
