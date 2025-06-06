// filepath: backend/migrations/XXXXXXXXXXXXXX-add-profile-picture-to-users.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
      await queryInterface.addColumn('Users', 'profilePicture', {
          type: Sequelize.STRING,
          allowNull: true,
      });
  },
  down: async (queryInterface, Sequelize) => {
      await queryInterface.removeColumn('Users', 'profilePicture');
  },
};