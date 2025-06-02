"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Messages", "status", {
      type: Sequelize.ENUM("sent", "received", "read"),
      defaultValue: "sent",
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Messages", "status");
  }
};
