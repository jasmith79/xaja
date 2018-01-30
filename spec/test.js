window.fetch = null;
const catcher = (ex, done) => err => {
  console.error(err);
  ex(true).toBe(false);
  done();
};

import * as xaja from '../src/xaja.mjs';

describe('toURLString', () => {
  it('should appropriately convert an object to a url query string', () => {
    expect(xaja.toURLString({'foo&up': 1, bar: 'pizza hut'})).toBe('foo%26up=1&bar=pizza%20hut');
  });
});

describe('fetch load', () => {
  it('should load the polyfill if fetch isn\'t there', done => {
    xaja.fetchLoaded.then(([fetch, Request]) => {
      expect(fetch).not.toBeNull();
      expect(Request).toBeDefined();
      done();
    });
  });
});

describe('request', () => {
  it('should return a Promise', () => {
    expect((xaja.request('/foo') instanceof Promise)).toBe(true);
  });

  it('should have a Request obj', () => {
    const req = xaja.request('/foo');
    expect((req.request instanceof Request)).toBe(true);
  });

  it('should reject on e.g. 404', done => {
    xaja.request('/foobar').then(_ => { throw new Error('failed!') }).catch(() => { expect(true).toBe(true); done(); });
  });

  it('should allow a basic GET', done => {
    xaja.request('/get').then(() => { expect(true).toBe(true); done(); }).catch(catcher);
  });

  it('should allow a GET with text data', done => {
    xaja.request({ url: '/data/text', data: '/foo' })
      .then(txt => {
        expect(txt).toBe('bar');
        done();
      })
      .catch(catcher(expect, done));
  });

  it('should allow fetching text', done => {
    xaja.request('test.txt')
      .then(txt => {
        expect(txt.trim()).toBe('Received');
        done();
      })
      .catch(catcher(expect, done));
  });

  it('should allow fetching JSON', done => {
    xaja.request('test.json')
      .then(json => {
        expect(json.ya).toBe('hoo');
        done();
      })
      .catch(catcher(expect, done));
  });

  it('should treat HTML like text', done => {
    xaja.request('test.html')
      .then(html => {
        expect(html.trim()).toBe('<div></div>');
        done();
      })
      .catch(catcher(expect, done));
  });

  it('should URL encode params for a GET with object data', () => {
    let p = xaja.get('/foo', {bar: 3});
    let match = p.request.url.match(/foo\?bar=3/);
    expect(match).not.toBeNull();
  });

  it('should ignore FormData on a GET', done => {
    const form = new FormData();
    form.append('foo', 'bar');
    xaja.get('/data/get/form', form)
      .then(resp => {
        expect(resp).toBe('success');
        done();
      })
      .catch(catcher(expect, done));
  });

  it('should timeout on a timeout', done => {
    xaja.request({ url: '/spin', timeout: 10 })
      .then(_ => { throw new Error('shouldnt see me') })
      .catch(() => { expect(true).toBe(true); done(); });
  });

  it('it should put auth params in an auth header...', () => {
    let p = xaja.request({ url: '/foo', data: { username: 'mary', password: 'roe', foo: 'bar' } });
    expect(p.request.headers.get('Authorization')).toBe('Basic bWFyeTpyb2U=');
  });

  it('...and NOT in the url query string.', () => {
    let p = xaja.request({ url: '/foo', data: { username: 'mary', password: 'roe', foo: 'bar' } });
    let match = p.request.url.match(/username=/);
    expect(match).toBe(null);
  });

  it('should allow a basic POST', done => {
    xaja.request({ url: '/foo', method: 'POST' })
      .then(() => {
        expect(true).toBe(true);
        done();
      })
      .catch(catcher(expect, done));
  });

  it('should allow a basic POST with text data', done => {
    xaja.request({ url: '/data/post/text', method: 'POST', data: 'foo' })
      .then(resp => {
        expect(resp).toBe('foo');
        done();
      })
      .catch(catcher(expect, done));
  });

  it('should use a FormData correctly on a POST', done => {
    const form = new FormData();
    form.append('foo', 'bar');
    xaja.request({ url: '/data/post/form', method: 'POST', data: form })
      .then(resp => {
        expect(resp).toBe('foobar');
        done();
      })
      .catch(catcher(expect, done));
  });

  it('should convert an object to a FormData on a POST', done => {
    xaja.request({ url: '/data/post/form', method: 'POST', data: { foo: 'bar' } })
      .then(resp => {
        expect(resp).toBe('foobar');
        done();
      })
      .catch(catcher(expect, done));
  });

  it('should allow POSTing JSON data if proper conf.', done => {
    xaja.request({
      url: '/data/post/json',
      method: 'POST',
      data: JSON.stringify({a: 1, b: 2}),
      contentType: 'application/json',
    })
    .then(() => { expect(true).toBe(true); done(); })
    .catch(catcher(expect, done));
  });

  it('should cache a GET if asked', done => {
    xaja.get('/cache', null, { cache: true })
      .then(_ => xaja.get('/cache', null, { timeout: 1 }))
      .then(resp => {
        expect(resp).toBe('success');
        return xaja.get('/cache');
      })
      .then(resp => {
        expect(resp).toBe('success');
        done()
      })
      .catch(catcher(expect, done));
  });

  // TODO: implement these
  // it('should override headers as approp.', done => {
  //
  // });
  //
  // it('should handle binary return data', done => {
  //
  // });
  //
  // it('should handle credential param correctly', done => {
  //
  // });
  //
  // it('should handle file uploads correctly', done => {
  //
  // });
});
