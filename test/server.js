var Hapi    = require('hapi');
var fs      = require('fs');
var inert   = require('inert');
var vision  = require('vision');
var DIR     = '/var/www/html';
var PATH    = '/var/www/html/xaja';
var PORT    = 8080;
var server  = new Hapi.Server();
server.connection({port: PORT});
server.register([inert, vision], function(err) {
  if (err != null) {
    throw err;
  }
  server.route({
    method: ['GET', 'POST'],
    path: '/{param*}',
    handler: function(req, reply) {
      var params;
      var relPath = req.path;
      var names   = relPath.split('/');
      var path    = PATH + relPath;
      var type    = names[1];
      switch (req.method.toLowerCase()) {
        case 'post': params = JSON.stringify(req.payload); break;
        case 'get': params = req.url.path.split('?')[1]; break;
        default: ''; break;
      }
      console.log(params);
      switch (type) {
        case 'img':
        case 'css':
        case 'src':
        case 'dist':
        case 'test':
        case 'bower_components':
        case 'elements':
          reply.file(path);
          break;
        default: reply.file(PATH + "/test/test.html"); break;
      }
    }
  });
});

server.start(function() {
  console.log("Server running at " + server.info.uri);
});
