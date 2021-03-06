const { Model } = require('objection');

class BolsaModel extends Model {

  static get idColumn() {
    return 'id_bolsa';
  }
  static get tableName() {
    return 'bolsa';
  }

  static get relationMappings() {
    // Importing models here is a one way to avoid require loops.
    const Puntos = require('./Puntos');
    const Clientes = require('./Cliente');
    return {
      puntos: {
        relation: Model.HasManyRelation,
        modelClass: Puntos,
        join: {
          from: 'bolsa.id_bolsa',
          to: 'puntos.id_bolsa'
        }
      },
      
    }
  }
}

module.exports = BolsaModel;