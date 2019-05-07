const { Model } = require('objection');

class UsoDetalleModel extends Model {

  static get idColumn() {
    return 'id_detalle';
  }
  static get tableName() {
    return 'uso_detalle';
  }

  static get jsonSchema() {
    return {    
        puntaje_utilizado: {type: 'number'},
        id_bolsa: {type: 'number'}, // optional
      
    };
  }
}

module.exports = UsoDetalleModel;