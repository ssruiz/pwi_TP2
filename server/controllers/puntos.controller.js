'use strict';
var model = require('../models/Puntos');
var controller = {
    getPuntos: async function (req, res) {
        try {
            var puntos = await model.query();
            res.json({ 'puntos': puntos });
        } catch (error) {
            console.log(error);
            res.json({ error: error.detail });
        }
    },
    createPuntos: async function (req, res) {
        try {
            const datos = req.body;
            const result = await model.query()
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
            const numDeleted = await model
                .query()
                .deleteById(id);
            return res.status(200).send({ 'Reglas eliminadas:': numDeleted });

        } catch (error) {
            res.json({
                status: "Failed!",
                error: error
            });
        }
    }
};

module.exports = controller;