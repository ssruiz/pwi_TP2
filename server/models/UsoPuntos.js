const { Model } = require('objection');

class UsoPuntosModel extends Model {

  static get idColumn() {
    return 'id_uso';
  }
  static get tableName() {
    return 'uso_puntos';
  }
  static get relationMappings() {
    // Importing models here is a one way to avoid require loops.
    const PuntosDetalle = require('./UsoDetalle');
    return {
      detalles: {
        relation: Model.HasManyRelation,
        modelClass: PuntosDetalle,
        join: {
          from: 'uso_puntos.id_uso',
          to: 'uso_detalle.id_uso'
        }
      },
      
    }
  }
}

module.exports = UsoPuntosModel;