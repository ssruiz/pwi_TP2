var express = require('express');
var Router = express.Router();
var controller = require('../controllers/puntos.controller');


Router.get('/', controller.getPuntos);

Router.post('/', controller.createPuntos);
Router.delete('/', controller.deletePuntos);

module.exports = Router;