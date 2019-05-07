'use strict';
var puntosModel = require('../models/Puntos');
var reglaModel = require('../models/Reglas');
var conceptoModel = require('../models/Concepto');
var bolsaModel = require('../models/Bolsa');
var usoPuntosModel = require('../models/UsoPuntos');
var usoDetalleModel = require('../models/UsoDetalle');
var clienteModel = require('../models/Cliente');
var moment = require('moment');
var email = require('./mail.controller');
const { transaction } = require('objection');
const { raw } = require('objection');

var controller = {
    getPuntos: async function (req, res) {
        try {
            var params = req.query;
            console.log(params);

            var puntos = await usoPuntosModel.query().
                skipUndefined().
                where('id_cliente', params.cliente).
                where('id_concepto', params.concepto).
                where('fecha', '>=', params.fi).
                where('fecha', '<=', params.ff).
                eager('detalles');
            res.json({ 'puntos': puntos });
        } catch (error) {
            console.log(error);
            res.json({ error: error.detail });
        }
    },
    getMontoPuntos: async function (req, res) {
        try {
            var params = req.params;
            var monto = params.monto

            var regla = await reglaModel.query().select('monto_equivalente')
                .where('limite_inferior', '<=', monto)
                .where('limite_superior', '>=', monto);
            var puntosPorMonto = regla[0].monto_equivalente;
            var puntosAsignar = Math.round(monto / puntosPorMonto);
          
            res.json({ 'monto': monto, 'puntos equivalentes': puntosAsignar });
        } catch (error) {
            console.log(error);
            res.json({ error: error.detail });
        }
    },
    createPuntos: async function (req, res) {
        try {
            const datos = req.body;
            const result = await PuntosModel.query()
                .insert(datos);
            return res.status(200).send({ 'regla creada': result });
        } catch (error) {
            console.log(error);
            res.json({ Error: error.detail })
        }
    },
    deletePuntos: async (req, res) => {
        try {
            var id = req.query.id;
            const numDeleted = await PuntosModel
                .query()
                .deleteById(id);
            return res.status(200).send({ 'Reglas eliminadas:': numDeleted });

        } catch (error) {
            res.json({
                status: "Failed!",
                error: error
            });
        }
    },
    usarPuntos: async (req, res) => {
        try {
            var datos = req.body;
            var puntajeObjetivo = datos.puntaje;
            var concept = await comprobarConcepto(datos.concepto_id, datos.puntaje);

            if (concept.aprobado === false)
                return res.json({ datos: concept });
            else {
                // se obtienen las bolsas
                var bolsas = await bolsaModel.query().
                    where('id_cliente', datos.cliente_id).
                    where('saldo', '>', 0).
                    orderBy('id_bolsa').
                    eager('puntos').modifyEager('puntos', builder => {
                        builder.where('estado', '=', 'A');
                        builder.orderBy('id_puntos');
                    });
                let trx;
                try {
                    trx = await transaction(puntosModel, bolsaModel, usoPuntosModel, usoDetalleModel, async (puntosModel, bolsaModel, usoPuntosModel, usoDetalleModel, tran) => {

                        var uso = await usoPuntosModel.query().insert({
                            id_cliente: datos.cliente_id,
                            puntaje_utilizado: puntajeObjetivo,
                            fecha: moment(),
                            id_concepto: concept.id
                        });
                        var puntosAcumulados = 0;

                        for (let item of bolsas) {
                            var control = 0;
                            var puntosSacados = 0;
                            var listDetalles = [];

                            for (let punt of item.puntos) {
                                var aux = Math.abs(punt.cantidad_puntos + puntosAcumulados);
                                if (aux > puntajeObjetivo) {
                                    let aux2 = Math.abs(punt.cantidad_puntos - puntajeObjetivo);
                                    let detalle = usoDetalleModel.jsonSchema;
                                    puntosAcumulados += aux2;
                                    puntosSacados += aux2;
                                    control += await puntosModel.query().patch({
                                        cantidad_puntos: raw('cantidad_puntos - ' + aux2)
                                    }).findById(punt.id_puntos);

                                    //detalle.id_uso = uso.id_uso;
                                    detalle.puntaje_utilizado = aux2;
                                    detalle.id_bolsa = item.id_bolsa;
                                    listDetalles.push(detalle);

                                }
                                else if (aux < puntajeObjetivo) {
                                    let detalle = usoDetalleModel.jsonSchema;
                                    puntosAcumulados += punt.cantidad_puntos;
                                    puntosSacados += punt.cantidad_puntos;
                                    control += await puntosModel.query().patch({
                                        cantidad_puntos: raw('cantidad_puntos - ' + punt.cantidad_puntos),
                                        estado: 'C'
                                    }).findById(punt.id_puntos);

                                    //detalle.id_uso = uso.id_uso;
                                    detalle.puntaje_utilizado = punt.cantidad_puntos;
                                    detalle.id_bolsa = item.id_bolsa;
                                    listDetalles.push(detalle);


                                }
                                else {
                                    let detalle = usoDetalleModel.jsonSchema;
                                    puntosAcumulados += punt.cantidad_puntos;
                                    puntosSacados += punt.cantidad_puntos;

                                    control += await puntosModel.query().patch({
                                        cantidad_puntos: raw('cantidad_puntos - ' + punt.cantidad_puntos),
                                        estado: 'C'
                                    }).findById(punt.id_puntos);

                                    //detalle.id_uso = uso.id_uso;
                                    detalle.puntaje_utilizado = punt.cantidad_puntos;
                                    detalle.id_bolsa = item.id_bolsa;
                                    listDetalles.push(detalle);
                                }
                            }
                            if (control > 0) {
                                await bolsaModel.query().patch(
                                    {
                                        saldo: raw('saldo - ' + puntosSacados),
                                    })
                                    .findById(item.id_bolsa);

                                await uso.$relatedQuery('detalles').insert(listDetalles);
                            }
                            if (puntajeObjetivo == puntosAcumulados)
                                break;
                        }
                        if (puntosAcumulados < puntajeObjetivo) {
                            await tran.rollback();
                        }
                        else
                            return puntajeObjetivo + concept.descripcion;

                    });

                } catch (error) {
                    return res.json({ 'El cliente no posee esta cantidad de puntos ': puntajeObjetivo });
                }

                var cliente = await clienteModel.query().findById(datos.cliente_id);
                enviarMail(cliente.email, concept.descripcion, puntajeObjetivo);
                return res.json({ datos: trx });

            }

        } catch (error) {
            console.log(error)
            res.json({
                status: "Failed!",
                error: error
            });
        }
    }
};

/* ----------------------------------------------------------- */
//                             Métodos adicionales

const comprobarConcepto = async (id, puntos) => {
    try {
        var con = await conceptoModel.query().findById(id);
        if (con.puntos <= puntos)
            return ({
                'id': con.id_concepto,
                'aprobado': true,
                'motivo': '',
                'puntos necestarios': con.puntos,
                'descripcion': ' Puntos asignados en concepto de <<' + con.descripcion + '>>'
            });
        else
            return ({
                'id': 0,
                'aprobado': false,
                'motivo': 'cantidad de puntos insuficientes para consumir en <<' + con.descripcion + '>>',
                'puntos necestarios': con.puntos,
                'descripcion': ' Puntos no asignados en concepto de <<' + con.descripcion + '>>'
            });
    } catch (error) {
        console.log(error);
        return ({ 'aprobado': false });
    }
};

const enviarMail = (correo, detalles, puntos) => {
    let mailOptions = {
        from: "tp2.pwi@gmail.com",
        to: correo,
        subject: 'Uso de puntos',
        text: 'Se le han asignado ' + puntos + ' puntos. ' + detalles
    };
    email.sendMail(mailOptions, function (error, info) {
        try {
            if (error) {
                throw error;
            } else {
                console.log("Email enviado satisfactoriamente!");
            }
        } catch (error) {
            console.log("error");
        }

    });
}
module.exports = controller;