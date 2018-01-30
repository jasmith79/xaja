window.fetch = null;
const catcher = (ex, done) => err => {
  console.error(err);
  ex(true).toBe(false);
  done();
};

let script = document.createElement('script');
script.src = './dist/xaja.min.js';
script.onload = () => {
  let xaja = window.xaja;
  describe('toURLString', () => {
    it('should appropriately convert an object to a url query string', () => {
      expect(xaja.toURLString({'foo&up': 1, bar: 'pizza hut'})).toBe('foo%26up=1&bar=pizza%20hut');
    });
  });

  describe('fetch load', () => {
    it('should load the polyfill if fetch isn\'t there', done => {
      xaja.fetchLoaded.then(done);
    });
  });

  describe('request', () => {
    it('should return a Promise', () => {
      expect((xaja.request('/foo') instanceof Promise)).toBe(true);
    });

    it('should have a Request obj', () => {
      expect((xaja.request('/foo').request instanceof Request)).toBe(true);
    });

    it('should reject on e.g. 404', done => {
      xaja.request('/foo').then(_ => { throw new Error('failed!') }).catch(done);
    });

    it('should allow a basic GET', done => {
      xaja.request('/get').then(done).catch(catcher);
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
      xaja.request('/test.txt')
        .then(txt => {
          expect(txt.trim()).toBe('Received');
          done();
        })
        .catch(catcher(expect, done));
    });

    it('should allow fetching JSON', done => {
      xaja.request('/test.json')
        .then(json => {
          expect(json.ya).toBe('hoo');
          done();
        })
        .catch(catcher(expect, done));
    });

    it('should treat HTML like text', done => {
      xaja.request('/test.html')
        .then(html => {
          expect(html.trim()).toBe('<div></div>')
        })
        .catch(catcher(expect, done));
    });

    it('should URL encode params for a GET with object data', () => {
      let p = xaja.get('/foo', {bar: 3});
      expect(p.request.url).toBe('foo?bar=3');
    });

    it('should use a FormData correctly on a GET', done => {
      const form = new FormData();
      form.append('/foo', 'bar');
      xaja.get('/data/get/form', form)
        .then(resp => {
          expect(resp).toBe('foobar');
          done();
        })
        .catch(catcher(expect, done));
    });

    it('should timeout on a timeout', done => {
      xaja.request({ url: '/spin', timeout: 10 })
        .then(_ => { throw new Error('shouldnt see me') })
        .catch(done);
    });

    it('it should put auth params in an auth header...', () => {
      let p = xaja.request({ url: '/foo', data: { username: 'mary', password: 'roe', foo: 'bar' } });
      expect(p.request.headers.Authorization).toBe("bWFyeTpyb2U=");
      done();
    });

    it('...and NOT in the url query string.', () => {
      let p = xaja.request({ url: '/foo', data: { username: 'mary', password: 'roe', foo: 'bar' } });
      expect(p.request.headers.url).toBe('foo?foo=bar');
      done();
    });

    it('should allow a basic POST', done => {
      xaja.request({ url: '/foo', method: 'POST' })
        .then(done)
        .catch(catcher(expect, done));
    });

    it('should allow a basic POST with text data', done => {
      xaja.request({ url: '/data/post/text', method: 'POST', data: 'foo' })
        .then(resp => {
          expect(resp).toBe('foo');
          done();
        })
        .catch(catcher);
    });

    it('should use a FormData correctly on a POST', done => {
      const form = new FormData();
      form.append('foo', 'bar');
      xaja.request({ url: '/data/post/form', method: 'POST', data: form })
        .then(resp => {
          expect(resp).toBe('foobar');
          done();
        })
        .catch(catcher);
    });

    it('should convert an object to a FormData on a POST', done => {
      xaja.request({ url: '/data/post/form', method: 'POST', data: { foo: 'bar' } })
        .then(resp => {
          expect(resp).toBe('foobar');
          done();
        })
        .catch(catcher);
    });

    it('should allow POSTing JSON data if proper conf.', done => {
      xaja.request({
        url: '/data/post/json',
        method: 'POST',
        data: JSON.stringify({a: 1, b: 2}),
        contentType: 'application/json',
      })
      .then(done)
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
};

document.head.appendChild(script);


import * as xaja from 'xaja';

describe('get', () => {
  it('should xhr in a request', done => {
    xaja
      .get('./spec/test.txt')
      .then(x => {
        expect(x).toBe('Received');
        done();
      })
      .catch(e => {
        expect(e.message).toBe('ignore');
        done();
      });
  });

  it('should be able to pass data with a get req.', done => {
    xaja
      .get('testrest', {chew: 'fat'})
      .then(x => {
        expect(x).toBe('chew:fat');
        done();
      })
      .catch(e => {
        expect(e.message).toBe('ignore');
        done();
      });
  });

  it('should throw on wrong args', () => {
    expect(() => xaja.get('./spec/test.txt', 3)).toThrow();
  });
});

describe('post', () => {
  it('should be able to post data', done => {
    xaja
      .post('testrest', {string: 'immastring'})
      .then(x => {
        expect(x).toBe('string=immastring');
        done();
      })
      .catch(e => {
        expect(e.message).toBe('ignore');
        done();
      });
  });

  it('should throw on wrong or missing args', () => {
    expect(() => xaja.post('testrest', [])).toThrow();
  });
});

describe('getJSON', () => {
  it('should fetch and parse json', done => {
    xaja.getJSON('./spec/test.json')
    .then(x => {
      expect(x.ya).toBe('hoo');
      done();
    })
    .catch(e => {
      expect(e.message).toBe('ignore');
      done();
    });
  });

  it('should reject on an invalid json string', done => {
    xaja.getJSON('./spec/test.txt')
      .then(() => { throw new Error('Should not see me') })
      .catch(e => {
        expect(e.message).toBe('Expected JSONString, got string');
        done();
      });
  });
});
