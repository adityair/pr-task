'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('purchase_request_items', 'item_type', {
      type: Sequelize.ENUM('BARANG', 'JASA'),
      allowNull: false,
      defaultValue: 'BARANG'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('purchase_request_items', 'item_type');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_purchase_request_items_item_type";');
  }
};
