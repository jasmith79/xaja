import * as xaja from 'xaja'
;
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

  it('should throw on missing or wrong args', () => {
    expect(() => xaja.get()).toThrow();
    expect(() => xaja.get('./spec/test.txt', 3)).toThrow();
  });
});

describe('post', () => {
  it('should be able to post data', done => {
    xaja
      .post('testrest', 'immastring')
      .then(x => {
        expect(x).toBe('immastring');
        done();
      })
      .catch(e => {
        expect(e.message).toBe('ignore');
        done();
      });
  });

  it('should throw on wrong or missing args', () => {
    expect(() => xaja.post('testrest')).toThrow();
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
        expect(e.message).toBe('Expected JSONString, got string.');
        done();
      });
  });
});
