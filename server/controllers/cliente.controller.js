'use strict';
var  model = require('../models/Cliente');
var controller = {
    test: function (req, res) {
        res.json("API WORKS");
    },
    getClients: async function (req, res) {
        try {
            var clients = await model.query();
            res.json({clients: clients});
        } catch (error) {
            console.log(error);

        }

    },
    createClient: async function(req,res){
        try
        {
            const newCliente = req.body;
            const idea = await model.query()
                         .insert(newCliente);
                         res.json({cliente: idea});
        }catch (error) {
            console.log(error);
            res.json({Error: error.detail})
        }
    }
};

module.exports = controller;