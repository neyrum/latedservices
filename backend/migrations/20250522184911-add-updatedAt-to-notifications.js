module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Notifications", "updatedAt", {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Notifications", "updatedAt");
  }
};
