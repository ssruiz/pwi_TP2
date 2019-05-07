'use strict';
var BolsaModel = require('../models/Bolsa');
var puntosModel = require('../models/Puntos');
var reglaModel = require('../models/Reglas');
var moment = require('moment');
const { raw } = require('objection');
var controller = {
    getBolsas: async function (req, res) {
        try {
            var params = req.query;
            console.log(params);
            var vencidos;
            var vigentes;
            var vencimiento;
            if (params.filtro == "vencidos")
                vencidos = moment();
            else if (params.filtro == "vigentes")
                vigentes = moment();

            if (params.vencimiento)
                vencimiento = moment().add(params.vencimiento, 'days').toISOString();
     
            var bolsas = await BolsaModel.query().
                skipUndefined().
                where('id_cliente', params.cliente).
                where('fecha_caducidad', '<=', vencidos).
                where('fecha_caducidad', '>=', vigentes).
                where('fecha_caducidad', vencimiento)

            res.json({ 'bolsas': bolsas });
        } catch (error) {
            console.log(error);
            res.json({ error: error.detail });
        }
    },
    createBolsa: async function (req, res) {
        try {
            const datos = req.body;
            var monto = datos.monto;

            var regla = await reglaModel.query().select('monto_equivalente')
                .where('limite_inferior', '<=', monto)
                .where('limite_superior', '>=', monto);
            var puntosPorMonto = regla[0].monto_equivalente;
            var puntosAsignar = monto / puntosPorMonto;
            datos.puntaje_asignado = Math.round(puntosAsignar);
            datos.saldo = Math.round(puntosAsignar);
            const result = await BolsaModel.query()
                .insert(datos);

            return res.status(200).send({ 'bolsa creada': result });
        } catch (error) {
            console.log(error);
            res.json({ Error: error.detail })
        }
    },
    deleteBolsa: async (req, res) => {
        try {
            var id = req.query.id;
            const numDeleted = await BolsaModel
                .query()
                .deleteById(id);
            return res.status(200).send({ 'Bolsas eliminadas: ': numDeleted });

        } catch (error) {
            res.json({
                status: "Failed!",
                error: error
            });
        }
    },
    asignarPuntos: async (req, res) => {
        try {
            var id = req.params.id;
            var datos = req.body;
            var fecha1 = moment(datos.fecha_inicio);
            var fecha2 = moment(datos.fecha_fin);
            var cantidadDias = fecha2.diff(fecha1, 'days');
            var totalPuntos;
            totalPuntos = await calcularPuntos(datos.monto);
            var rest2 = await actualizarBolsa(id, datos.monto, totalPuntos.puntos);
            if (totalPuntos.puntos > 0) {
                console.log(totalPuntos.id);
                var result = await puntosModel.query().insert({
                    'fecha_inicio': datos.fecha_inicio,
                    'fecha_fin': datos.fecha_fin,
                    'dias_duracion': cantidadDias,
                    'cantidad_puntos': totalPuntos.puntos,
                    'id_bolsa': id,
                    'id_reglas': totalPuntos.id,
                    'monto': datos.monto
                });


                return res.json({ 'Puntos asignados: ': result });
            }
            else {
                res.json({
                    status: "Failed!",
                    error: 'Puntos insuficientes'
                });
            }


        } catch (error) {
            console.log(error);

            res.json({
                status: "Failed!",
                error: error
            });
        }
    },
    verificarPuntos: async (req, res) => {
        try {
            var cambios = 0;
            var bolsas = await BolsaModel.query().eager('puntos').modifyEager('puntos', builder => {
                builder.where('estado', '=', 'A').where('fecha_fin', '<', moment());
            });

            const loop = async () => {
                try {
                    var i = 0;
                    for (let element of bolsas) {
                        var c = 0;
                        var sumaMonto = 0;
                        var sumaPuntos = 0;
                        for (let puntoAct of element.puntos) {
                            sumaMonto += parseInt(puntoAct.monto);
                            sumaPuntos += puntoAct.cantidad_puntos;
                            c += await puntosModel.query().patch({
                                estado: 'B'
                            }).findById(puntoAct.id_puntos);
                        }
                        if (c > 0) {
                            await BolsaModel.query().patch(
                                {
                                    monto: raw('monto - ' + sumaMonto),
                                    puntaje_asignado: raw('puntaje_asignado - ' + sumaPuntos),
                                    saldo: raw('saldo - ' + sumaPuntos),
                                })
                                .findById(element.id_bolsa);
                            i += 1;
                        }

                    }
                    return i;
                } catch (error) {
                    console.log(error);
                }
            };
            cambios = await loop();
            return res.json(
                {
                    'bolsas actualizadas': cambios
                });
            //console.log(bolsas[3].puntos[0].dias_duracion);

        } catch (error) {
            console.log(error)
            res.json({
                status: "Failed!",
                error: error
            });
        }
    }

};

/*-------------------------------------------------------------------------------- */

// Métodos adicionales

// Calcula los puntos para cierto monto
var calcularPuntos = async (monto) => {
    try {
        var regla = await reglaModel.query().select('id_reglas', 'monto_equivalente')
            .where('limite_inferior', '<=', monto)
            .where('limite_superior', '>=', monto);
        var puntosPorMonto = regla[0].monto_equivalente;
        var idRegla = regla[0].id_reglas;
        var puntosAsignar = monto / puntosPorMonto;

        return ({ 'id': idRegla, 'puntos': puntosAsignar });
    } catch (error) {
        console.log(error);
        return -1;
    }
};

// actualiza la bolsa con el monto y puntos asignados
const actualizarBolsa = async (id, monto, puntos) => {

    try {
        console.log('iD', id);
        console.log('monto', typeof (monto));
        console.log('puntos', puntos);

        var cambios = await BolsaModel.query().patch(
            {
                monto: raw('monto + ' + monto),
                puntaje_asignado: raw('puntaje_asignado + ' + puntos)
            })
            .findById(id);
        return cambios;
    } catch (error) {
        console.log(error);

        return error;
    }
};
/*-------------------------------------------------------------------------------- */
module.exports = controller;