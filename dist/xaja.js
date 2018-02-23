import extractType from '../../../node_modules/extracttype/extracttype.js';

const global = new Function('return this;')();
const {
  Promise,
  encodeURIComponent,
  btoa,
  fetch,
  localStorage,
  Error,
  Object,
  Request,
} = global;

const base64Encode = str => {
  let bstring = encodeURIComponent(str)
    .replace(/%([0-9A-F]{2})/g, (match, p1) => String.fromCharCode("0x" + p1));

  return btoa(bstring);
};

const extractUserAndPass = obj => {
  if (obj) {
    const [{user, pass}, rest] = Object.entries(obj).reduce(([usrpss, o], [k, v]) => {
      if (k.match(/user/i)) {
        usrpss.user = v;
      } else if (k.match(/pass/i)) {
        usrpss.pass = v;
      } else {
        o[k] = v;
      }

      return [usrpss, o];
    }, [{}, {}]);

    if (user && pass) {
      return [`Basic ${base64Encode(user + ':' + pass)}`, rest];
    }

    return [{}, rest];
  }

  return null;
};

export const toURLString = arg => {
  switch (extractType(arg)) {
    case 'Null':
    case 'Undefined':
      return '';

    case 'String':
      return encodeURIComponent(arg);

    default:
      return Object.entries(arg)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&');
  }
};

export const fetchLoaded = new Promise((resolve, reject) => {
  if (!fetch) {
    const script = document.createElement('script');
    script.src = './node_modules/whatwg-fetch/fetch.js';
    script.onload = _ => {
      resolve([global.fetch, global.Request]);
    };

    script.onerror = err => {
      reject(err);
    };

    global.document.head.appendChild(script);
  } else {
    resolve([global.fetch, global.Request]);
  }
});

export const request = arg => {
  let {
    url,
    data,
    method='GET',
    responseType,
    contentType,
    timeout=0,
    cache,
    headers,
    credentials='same-origin',
  } = arg;

  if (!url) {
    if (extractType(arg) === 'String') {
      url = arg;
    } else {
      return Promise.reject(new TypeError('HTTP request must include a url.'));
    }
  }

  if (!responseType) {
    let match = url.match(/\.(html|json|text|txt)$/);
    if (match) {
      responseType = match[1] === 'txt' ? 'text' : match[1];
    } else {
      responseType = 'text';
    }
  }

  let auth, body;
  if (data) {
    switch (extractType(data)) {
      case 'String':
        contentType = contentType || 'text/plain;charset=UTF-8';
        body = data;
        break;

      case 'FormData':
        body = data;
        break;

      case 'Object':
        let [a, b] = extractUserAndPass(data);
        auth = a;
        if (method.toUpperCase() === 'GET') {
          url = `${url}?${toURLString(b)}`;
          contentType = contentType || 'application/x-www-form-urlencoded;charset=UTF-8';
        } else {
          body = new FormData();
          Object.entries(b).forEach(([k, v]) => {
            body.append(k, v);
          });
        }

        break;

      default:
        body = data;
        break;
    }
  }

  const hdrs = headers || new Headers();

  if (auth && !hdrs.get('Authorization')) hdrs.set('Authorization', auth);
  if (contentType && !hdrs.get('Content-Type')) hdrs.set('Content-Type', contentType);

  const opts = {
    method,
    headers: hdrs,
    credentials,
  };

  if (method.toUpperCase() !== 'GET') opts.body = body;
  if (method.toUpperCase() === 'POST' && !opts.body) opts.body = {};

  let req = new Request(url, opts);
  const p = fetchLoaded.then(([fetch, Request]) => {
    return new Promise((resolve, reject) => {
      let innerp = fetch(req).then(resp => {
        if (resp.status >= 200 && resp.status < 300) {
          return resp;
        } else {
          const err = new Error(resp.statusText);
          err.response = resp;
          const cached = localStorage.getItem(url);
          if (cached) {
            console.warn(err.message + ' resolving with cached data...');
            const resCached = () => Promise.resolve(cached);
            return {
              json: resCached,
              text: resCached,
              blob: resCached,
              arrayBuffer: resCached,
            };
          } else {
            throw err;
          }
        }
      });

      if (timeout) {
        const handle = setTimeout(() => {
          const msg = `Request for ${url} reached timeout of ${timeout}ms.`;
          const cached = localStorage.getItem(url);
          if (cached) {
            console.warn(msg + ' resolving with cached data...');
            const resCached = () => Promise.resolve(cached);
            resolve({
              json: resCached,
              text: resCached,
              blob: resCached,
              arrayBuffer: resCached,
            });
          } else {
            reject(new Error(msg));
          }
        }, timeout);

        innerp.then(resp => {
          global.clearTimeout(handle);
          resolve(resp);
        });
      } else {
        resolve(innerp);
      }
    });
  });
  p.request = req;

  const rt = responseType.toLowerCase();
  let promise;
  switch (rt) {
    case 'text':
    case 'html':
      promise = p
        .then(resp => resp.text())
        .then(txt => {
          if (cache && method.toUpperCase() === 'GET') localStorage.setItem(url, txt);
          return txt;
        });

      Object.defineProperty(promise, 'request', { get: () => p.request });
      return promise;

    case 'json':
      promise = p
        .then(resp => resp.json())
        .then(json => {
          if (cache && method.toUpperCase() === 'GET') localStorage.setItem(url, json);
          return json;
        });

      Object.defineProperty(promise, 'request', { get: () => p.request });
      return promise;

    case 'blob':
    case 'arrayBuffer':
      Object.defineProperty(promise, 'request', { get: () => p.request });
      return p.then(resp => resp[rt]());

    case 'stream':
    default:
      return p;
  }
};

export const get = (url, data, opts={}) => {
  const conf = Object.entries(opts).reduce((acc, [k, v]) => (acc[k] = v, acc), {});
  conf.method = 'GET';
  conf.url = url;
  if (data) conf.data = data;
  return request(conf);
};

export const getJSON = (url, data, opts={}) => {
  const conf = Object.entries(opts).reduce((acc, [k, v]) => (acc[k] = v, acc), {});
  conf.method = 'GET';
  conf.url = url;
  conf.responseType = 'json';
  if (data) conf.data = data;
  return request(conf);
};

export const post = (url, data, opts={}) => {
  const conf = Object.entries(opts).reduce((acc, [k, v]) => (acc[k] = v, acc), {});
  conf.method = 'POST';
  conf.url = url;
  if (data) conf.data = data;
  return request(conf);
};

export default request;
