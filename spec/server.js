#!/usr/bin/env node
var http = require('http');
var fs   = require('fs');
var d    = require('../node_modules/decorators-js/dist/decorators.js');
var qs   = require('querystring');

var dir  = '.';
var read = d.denodeify(fs.readFile);
var server = http.createServer(function(req, res) {
  //this is terrible, but simple enough for testing
  var reqPath = dir + req.url;
  var path;
  if (req.method.toLowerCase() === 'post') {
    var body = '';
    req.on('data', function(chunk) {
      body += chunk.toString();
    });

    req.on('end', e => {
      res.end(body);
    });
  } else {
    var arr = reqPath.split('?');
    var temppath = arr[0];
    var query = arr[1];
    switch (temppath) {
      case './':
      case '/':
      case '':
        path = './spec/index.html';
        break;
      case './alt.html':
        path = './spec/alt.html';
        break;
      case './testrest':
        var obj = qs.parse(query);
        res.end(Object.keys(obj).reduce((str, k) => str += `${k}:${obj[k]}`, ''));
        break;
      default:
        path = reqPath;
    }
  }

  if (path) {
    var p = read(path, 'utf-8');
    p.then(function(fstr) {
      res.end(fstr);
    }).catch(function(e) {
      console.log('Couldnt find ' + path);
      res.statusCode = 404;
      res.end('File not found');
    });
  } else {
    console.log('Couldnt find ' + reqPath);
    res.statusCode = 404;
    res.end('File not found');
  }
});
server.listen(8080, function() {
  console.log('Listening at localhost 8080');
});
