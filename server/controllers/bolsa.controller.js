'use strict';
var model = require('../models/Bolsa');
var puntosModel = require('../models/Puntos');
var reglaModel = require('../models/Reglas');
var moment = require('moment');
var controller = {
    getBolsas: async function (req, res) {
        try {
            var bolsas = await model.query();
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
            const result = await model.query()
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
            const numDeleted = await model
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
            console.log('dias = ', cantidadDias);
            //calcularPuntos(datos.monto);
            var totalPuntos;
            totalPuntos = await calcularPuntos(datos.monto);
            if(totalPuntos.puntos>0){
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
                return res.json({ 'Puntos asignados: ': 'works' });
            }
            else{
                res.json({
                    status: "Failed!",
                    error: totalPuntos
                });
            }

            
        } catch (error) {
            res.json({
                status: "Failed!",
                error: error
            });
        }
    },

};
// Métodos adicionales
var calcularPuntos = async (monto,res,rej) => {
    try {
        var regla = await reglaModel.query().select('id_reglas','monto_equivalente')
            .where('limite_inferior', '<=', monto)
            .where('limite_superior', '>=', monto);
        var puntosPorMonto = regla[0].monto_equivalente;
        var idRegla = regla[0].id_reglas;
        var puntosAsignar = monto / puntosPorMonto;
        
        return ({'id': idRegla , 'puntos': puntosAsignar});
    } catch (error) {
        console.log(error);
        return -1;
    }
}
module.exports = controller;