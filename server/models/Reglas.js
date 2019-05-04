const { Model } = require('objection');

class ReglasModel extends Model {

  static get idColumn() {
    return 'id_reglas';
  }
  static get tableName() {
    return 'reglas';
  }
}

module.exports = ReglasModel;