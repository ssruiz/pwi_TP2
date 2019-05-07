const cron = require('node-cron');
var http = require('http');
var controller = require('./controllers/cliente.controller');


const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/bolsas/verificar',
    method: 'GET',
};

const job = cron.schedule('0 0 * * *', () => {
    console.log('Verificando vencimiento de puntos');
    //Sconsole.log('Clientes registrados...');
    http.request(options, OnResponse).end();
});


function OnResponse(response) {
    var data = ''; //This will store the page we're downloading.
    response.on('data', function (chunk) { //Executed whenever a chunk is received.
        data += chunk; //Append each chunk to the data variable.
    });

    response.on('end', function () {
        console.log(data);
        console.log('Puntos verificados');
    });
}
job.start();

module.exports = job;