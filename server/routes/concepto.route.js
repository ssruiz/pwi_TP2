var express = require('express');
var Router = express.Router();
var controller = require('../controllers/concepto.controller');


Router.get('/', controller.getConceptos);

Router.post('/', controller.createConcepto);
Router.delete('/', controller.deleteConcepto);

module.exports = Router;