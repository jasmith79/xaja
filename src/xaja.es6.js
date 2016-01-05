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

  //checkJSON JSON -> {k:v}
  //checkJSON String -> Error
  const checkJSON = (json) => {
    switch (true) {
      case typeof json !== 'string': return new Error(`Invalid type ${typeof json} in checkJSON`);
      case json.length < 3: return new Error("Empty JSON response");
      default: return JSON.parse(json);
    }
  };

  return {
    get: (url, data, returnType) => {
      return new Promise((resolve, reject) => {
        const params = data == null ? '' : '?' + toURLString(data);
        if (params instanceof Error) {
          reject(params);
          return null;
        }
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url + params);
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
          reject(new Error("Network Error"));
          return null;
        }
        xhr.send();
        return null;
      });
    },
    post: (url, data, returnType) => {
      return new Promise((resolve, reject) => {
        const params = data == null ? '' : toURLString(data);
        if (params instanceof Error) {
          reject(params);
          return null;
        }
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url);
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
          reject(new Error("Network Error"));
          return null;
        }
        xhr.send(params);
        return null;
      });
    },
    getJSON: function(url, data) {
      return this.get(url, data, 'json');
    },
  };
});
