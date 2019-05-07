var express = require('express');
var Router = express.Router();
var controller = require('../controllers/puntos.controller');


Router.get('/', controller.getPuntos);
Router.get('/:monto', controller.getMontoPuntos);
Router.post('/', controller.createPuntos);
Router.delete('/', controller.deletePuntos);
Router.post('/usarPuntos', controller.usarPuntos);

module.exports = Router;