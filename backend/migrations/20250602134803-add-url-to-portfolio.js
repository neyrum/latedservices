module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Portfolios', 'url', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Portfolios', 'url');
  }
};
