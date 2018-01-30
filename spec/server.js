'use strict';
const INTERNAL_ERROR = JSON.stringify(
  "Sorry but the server encountered an error and cannot process your request"
);

const hapi = require('hapi');
const fs = require('fs');
const cli = require('commander');
const inert = require('inert');

const version = fs.readFileSync('./package.json', 'utf8').match(/"version": "([\d\.]+)"/)[1];

cli
  .version(version)
  .arguments('[port]')
  .option('-h, --host <host>', 'Hostname');

cli.parse(process.argv);

const HOST = cli.host || '0.0.0.0';
const PORT = cli.port || 8080;

const destructureAuth = header => {
  if (!header) {
    console.log(`No authorization header present.`);
    return ['', ''];
  }
  let [_, str] = header.split(' ');
  let auth = new Buffer(str, 'base64').toString();
  let [user, pass] = auth.includes(':') ? auth.split(':') : [auth, ''];
  return [user, pass];
};

const clogger = f => (req, resp, ...args) => {
  console.log(`Incoming request for ${req.path}.`);
  f(req, resp, ...args);
};

const fileHandler = (req, resp) => {
  resp.file(`.${req.path}`);
};

const server = new hapi.Server();
server.connection({ port: PORT, host: HOST });

server.register([inert], err => {
  if (err) throw err;

  server.route({
    method: 'GET',
    path: '/',
    handler: clogger((req, resp) => {
      resp.file('./spec/index.html');
    }),
  });

  server.route({
    method: 'GET',
    path: '/spec/{p*}',
    handler: clogger(fileHandler),
  });

  server.route({
    method: 'GET',
    path: '/node_modules/{p*}',
    handler: clogger(fileHandler),
  });

  server.route({
    method: 'GET',
    path: '/dist/{p*}',
    handler: clogger(fileHandler),
  });

  server.route({
    method: 'GET',
    path: '/src/{p*}',
    handler: clogger(fileHandler),
  });

  server.route({
    method: 'GET',
    path: '/foo',
    handler: clogger((req, resp) => {
      resp('success');
    }),
  });

  server.route({
    method: 'POST',
    path: '/foo',
    handler: clogger((req, resp) => {
      resp('success');
    }),
  });

  server.route({
    method: 'GET',
    path: '/get',
    handler: clogger((req, resp) => {
      resp('success');
    }),
  });

  server.route({
    method: 'GET',
    path: '/data/text',
    handler: clogger((req, resp) => {
      console.log(`datatext params are ${req.params}`);
      console.log(`datatext payload is ${req.payload}`);
      resp('bar');
    }),
  });

  server.route({
    method: 'POST',
    path: '/data/post/text',
    handler: clogger((req, resp) => {
      resp(req.payload);
    }),
  });

  server.route({
    method: 'GET',
    path: '/test.txt',
    handler: clogger((req, resp) => {
      resp.file('./spec/test.txt');
    }),
  });

  server.route({
    method: 'GET',
    path: '/test.json',
    handler: clogger((req, resp) => {
      resp.file('./spec/test.json');
    }),
  });

  server.route({
    method: 'GET',
    path: '/test.html',
    handler: clogger((req, resp) => {
      resp.file('./spec/test.html');
    }),
  });

  server.route({
    method: 'GET',
    path: '/spin',
    handler: clogger((req, resp) => {
      setTimeout(() => {
        resp('foobar');
      }, 30);
    }),
  });

  let cacheflag = 3;
  server.route({
    method: 'GET',
    path: '/cache',
    handler: clogger((req, resp) => {
      cacheflag--;
      switch (cacheflag) {
        case 2:
          resp('success');
          break;

        case 1:
          setTimeout(() => {
            resp('fail'); // should timeout and pull 'success' from cache
          }, 10);
          break;

        case 0:
          resp(INTERNAL_ERROR).code(500);
          break;
      }
    }),
  });

  server.route({
    method: 'POST',
    path: '/data/post/form',
    handler: clogger((req, resp) => {
      resp(Object.entries(req.payload).reduce((x, [k, v]) => { return x + k + v; }, ''));
    }),
  });

  server.route({
    method: 'GET',
    path: '/data/get/form',
    handler: clogger((req, resp) => {
      resp('success');
    }),
  });

  server.route({
    method: 'POST',
    path: '/data/post/json',
    handler: clogger((req, resp) => {
      resp(Object.entries(req.payload).reduce((x, [k, v]) => { return x + k + v; }, ''));
    }),
  });

  server.start(e => {
    if (e) throw e;
    console.log(`Responding to requests on port ${server.info.uri} for ${server.info.host}.`);
  });
});
