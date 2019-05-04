'use strict';
var model = require('../models/Reglas');
var controller = {
    getReglas: async function (req, res) {
        try {
            var reglas = await model.query();
            res.json({ 'reglas': reglas });
        } catch (error) {
            console.log(error);
            res.json({ error: error.detail });
        }
    },
    createRegla: async function (req, res) {
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
    deleteRegla: async (req, res) => {
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