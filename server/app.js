'use strict';

//imports
var express = require('express');
var app = express();
var cors = require('cors');

// Configuración de las rutas
var clientRoutes = require('./routes/cliente.route');
var conceptoRoutes = require('./routes/concepto.route');
var reglasRoutes = require('./routes/reglas.route');
var bolsaRoutes = require('./routes/bolsa.routes');
// configuración knex ( conexión a base de datos)
const { Model } = require('objection');
const knex = require('./knex_file');
Model.knex(knex);

app.set('port', process.env.PORT || 3000);
////app.set('superSecret', config.secret);

// midlewares
app.use(express.json());
app.use(cors());

// Inclusión de rutas
app.use('/api/cliente', clientRoutes);
app.use('/api/concepto', conceptoRoutes);
app.use('/api/reglas', reglasRoutes);
app.use('/api/bolsas', bolsaRoutes)
// Iniciando el server
const server = app.listen(app.get('port'), () => {
  console.log("Server is running on port ", app.get('port'));
});


// apagado del servidor
process.on('SIGINT', () => {
  server.close(() => {
    knex.destroy();
    console.log('Servidor Cerrado.');
  });
});
// export

module.exports = app;