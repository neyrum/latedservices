'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('AuditLogs', {
      fields: ['userId'],
      type: 'foreign key',
      references: { table: 'Users', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('Services', {
      fields: ['createdBy'],
      type: 'foreign key',
      references: { table: 'Users', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('Ratings', {
      fields: ['userId'],
      type: 'foreign key',
      references: { table: 'Users', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('Requests', {
      fields: ['userId'],
      type: 'foreign key',
      references: { table: 'Users', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('Requests', {
      fields: ['assignedAdminId'],
      type: 'foreign key',
      references: { table: 'Users', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('AuditLogs', 'AuditLogs_userId_fkey');
    await queryInterface.removeConstraint('Services', 'Services_createdBy_fkey');
    await queryInterface.removeConstraint('Ratings', 'Ratings_userId_fkey');
    await queryInterface.removeConstraint('Requests', 'Requests_userId_fkey');
    await queryInterface.removeConstraint('Requests', 'Requests_assignedAdminId_fkey');
  }
};
