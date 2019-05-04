'use strict';

const { Model } = require('objection');
class ClienteModel extends Model {

  static get idColumn() {
    return 'id_cliente';
  }
  static get tableName() {
    return 'cliente';
  }

  static get relationMappings() {
    // Importing models here is a one way to avoid require loops.
    const Bolsa = require('./Bolsa');
    
    return {
      bolsas: {
        relation: Model.HasManyRelation,
        modelClass: Bolsa,
        join: {
          from: 'cliente.id_cliente',
          to: 'bolsa.id_cliente'
        }
      },
    }
  }
    
}

module.exports = ClienteModel;