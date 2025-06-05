module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Requests', 'address');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Requests', 'address', {
      type: Sequelize.JSON,
      allowNull: true,
    });
  },
};
