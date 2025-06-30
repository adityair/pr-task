"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("approvals", "approvedAt", {
      type: Sequelize.DATE,
      allowNull: true,
      comment: "Timestamp when approval was made",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("approvals", "approvedAt");
  },
};
