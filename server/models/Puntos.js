'use strict';

const { Model } = require('objection');

class PuntosModel extends Model {

  static get idColumn() {
    return 'id_puntos';
  }
  static get tableName() {
    return 'puntos';
  }
}

module.exports = PuntosModel;