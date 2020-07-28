var express = require('express');
var server = express();
var bodyParser = require('body-parser');
var apiRouter = require('./apiRouters').router;

server.use(bodyParser.urlencoded({ extended :true}));
server.use(bodyParser.json());

server.get('/',(request,response) => {
   response.setHeader('Content-type','text/html');
   response.status(200).send("Bienvenue sur la page d'accueil");

});
 server.use('/api/',apiRouter);
server.listen(8080);