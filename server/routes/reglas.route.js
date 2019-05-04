var express = require('express');
var Router = express.Router();
var controller = require('../controllers/reglas.controller');


Router.get('/', controller.getReglas);
Router.post('/', controller.createRegla);
Router.delete('/', controller.deleteRegla);

module.exports = Router;