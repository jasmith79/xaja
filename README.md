# Xaja

A simple ajax helper library.

## Basic Usage

Interface is *similar* to jQuery's `$.ajax`, you can make a request:

```javascript
const result = xaja.request('/some/url');
result.then(text => console.log(text));

// can also take a configuration object:
const result = xaja.request({
  url: '/some/other/url',
  method: 'GET',
  responseType: 'json',
}).then(json => {
  // do stuff with the json data
});

// alternatively using async/await
const json = await xaja.request('/some/json/data');
// do something with the result
```

Xaja abstracts over [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API), and will load an appropriate polyfill if there's no native implementation. NOTE: xaja does not load a Promise polyfill, if you're using browsers old enough to lack Promise support you'll need to load a polyfill before xaja. In the case of native fetch, you can get the raw response object:

```javascript
const stream = xaja.request({
  url: '/some/stream/of/data',
  responseType: 'stream',
}).then(response => {
  if (response instanceof Response) {
    console.log('I am a raw Response object!');
  }
});
```

## Shorthand

In addition to the `request` function, xaja also offers `get`, `post`, and `getJSON` shorthand functions that invoke `request` with the appropriate configuration. They have the following signature:

#### `(url:String, data:FormData|String|Object<optional>, options:Object<optional>) => Promise(Any)`

## Options Object

The options object supports the following parameters. Only the url parameter is required:

### `url:String`
The url to be requested.

### `data:FormData|String|Object`
Data to be passed along with the request. For `POST` requests it's passed as the body to the fetch call, for `GET` requests it is converted to a query string and appended to the url. Usernames and passwords are automatically stripped out and converted to an Authorization header.

### `method:String`
HTTP method. Defaults to `GET`.

### `responseType:String`
Expected response, when set to `text` or `html` automatically pulls the response text. For `json` it pulls the responsejson, etc. If set to `stream` or some unknown value you will get back the raw Response object. Defaults to `text`.

### `contentType:String`
Mime type of the supplied data, e.g. `application/x-www-form-urlencoded`. Browsers are now pretty good at guessing this without any programmer input.

### `timeout:Number`
Amount of time in milliseconds before the returned Promise rejects. Defaults to none.

### `cache:Boolean`
If true the response's text/json/etc. will be cached in localStorage by the url, on subsequent requests if there is a timeout or error the Promise will resolve to the cached value rather than rejecting. Defaults to false.

### `headers:Headers|Object`
The headers for the request.

### `credentials:String`
The security setting for requests: e.g. `same-origin`.

## Accessing the Request object
The promises returned by `request` et. al., if being used directly (rather than `async/await`) have an additional `request` property that contains the underlying `Request` object:

```javascript
const promise = xaja.get('/some/url');
promise.request instanceof Request; // true
```
