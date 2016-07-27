import * as typed from 'js-typed';
import * as decor from 'decorators-js';
import * as utils from 'utils';

//from https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding
//note that btoa is IE 10+
const base64Encode = typed.guard('string', str => {
  let bstring = encodeURIComponent(str)
    .replace(/%([0-9A-F]{2})/g, (match, p1) => String.fromCharCode("0x" + p1));

  return btoa(bstring);
});

//toURLString :: a -> String
const toURLString = typed.Dispatcher([
  [['string'], str => encodeURIComponent(str)],
  [['nil'], () => ''],
  [['object'], a => Object.keys(a)
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(a[k])}`)
    .join("&")]
]);

const stripUserAndPass = typed.Dispatcher([
  [['nil'], () => []],
  [['object'], obj => {
    const keys = Object.keys(obj);
    let retObj = {}, user = "", pass = "", authStr = "";
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
    if (user) {
      authStr = "Basic " + base64Encode(user + ":" + pass);
    }
    return [toURLString(retObj), authStr];
  }]
]);

typed.defType('__string+', s => s && typed.isType('string', s));
typed.sumType('__string|object', 'string', 'object');

const get = typed.guard(1, ['__string+', '__string|object'], (url, data) => {
  let [params, authStr] = data ? stripUserAndPass(data) : [null, null];
  return new Promise((resolve, reject) => {
    const path = url + (params ? `?${params}` : '');
    const xhr = new XMLHttpRequest();
    xhr.open('GET', path);
    if (authStr) {
      xhr.setRequestHeader('Authorization', authStr);
    }
    xhr.onload = () => {
      if (xhr.status < 400 && xhr.status >= 200) {
        resolve(xhr.responseText);
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
});

const post = typed.guard(['__string+', 'object'], (url, data) => {
  let [params, authStr] = stripUserAndPass(data);
  return new Promise((resolve, reject) => {
    const params = toURLString(data);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8");
    if (authStr) {
      xhr.setRequestHeader('Authorization', authStr);
    }
    xhr.onload = () => {
      if (xhr.status < 400 && xhr.status >= 200) {
        resolve(xhr.responseText);
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
    xhr.send(params);
    return null;
  });
});

const getJSON = (url, data) => utils.unpackJSON(data ? get(url, data) : get(url));

export {
  get,
  post,
  getJSON,
  toURLString,
}