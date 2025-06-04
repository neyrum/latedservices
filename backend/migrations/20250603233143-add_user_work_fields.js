module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Users", "faculty", { type: Sequelize.STRING });
    await queryInterface.addColumn("Users", "area", { type: Sequelize.STRING });
    await queryInterface.addColumn("Users", "work_identity", { type: Sequelize.STRING });
    await queryInterface.addColumn("Users", "department", { type: Sequelize.STRING });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Users", "faculty");
    await queryInterface.removeColumn("Users", "area");
    await queryInterface.removeColumn("Users", "work_identity");
    await queryInterface.removeColumn("Users", "department");
  }
};
