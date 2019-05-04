var express = require('express');
var Router = express.Router();
var controller = require('../controllers/cliente.controller');


Router.get('/test',controller.test);
Router.get('/',controller.getClients);

Router.post('/',controller.createClient);

module.exports = Router;