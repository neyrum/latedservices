module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Services", "icon", {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: "fas fa-tools" // Icono por defecto
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Services", "icon");
  }
};
