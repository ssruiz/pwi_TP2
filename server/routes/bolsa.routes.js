var express = require('express');
var Router = express.Router();
var controller = require('../controllers/bolsa.controller');


Router.get('/', controller.getBolsas);
Router.post('/', controller.createBolsa);
Router.delete('/', controller.deleteBolsa);
Router.post('/asignarPuntos/:id', controller.asignarPuntos);
Router.get('/verificar', controller.verificarPuntos);
module.exports = Router;