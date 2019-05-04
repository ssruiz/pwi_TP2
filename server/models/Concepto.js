const { Model } = require('objection');

class ConceptoModel extends Model {

  static get idColumn() {
    return 'id_concepto';
  }
  static get tableName() {
    return 'concepto';
  }
}

module.exports = ConceptoModel;