'use strict';
var model = require('../models/Concepto');
var controller = {
    getConceptos: async function (req, res) {
        try {
            var conceptos = await model.query();
            res.json({ conceptos: conceptos });
        } catch (error) {
            console.log(error);
        }
    },
    createConcepto: async function (req, res) {
        try {
            const newConcepto = req.body;
            const result = await model.query()
                .insert(newConcepto);
            return res.status(200).send({ concepto: result });
        } catch (error) {
            console.log(error);
            res.json({ Error: error.detail })
        }
    },
    deleteConcepto: async (req, res) => {
        try {
            var id = req.query.id;
            console.log("ID", req.params);
            const numDeleted = await model
                .query()
                .deleteById(id);
            return res.status(200).send({ resultado: numDeleted });

        } catch (error) {
            res.json({
                status: "Failed!",
                error: error
            });
        }
    }
};

module.exports = controller;