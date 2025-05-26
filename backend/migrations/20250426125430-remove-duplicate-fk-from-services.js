'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Elimina la constraint duplicada (¡cambia el nombre si es diferente!)
    await queryInterface.removeConstraint(
      'Services', 
      'Services_createdBy_fkey1'  // Nombre de la constraint a eliminar
    );
  },

  async down(queryInterface, Sequelize) {
    // Opcional: Recrear la constraint si necesitas revertir (no obligatorio)
    await queryInterface.addConstraint('Services', {
      fields: ['createdBy'],
      type: 'foreign key',
      name: 'Services_createdBy_fkey1',
      references: {
        table: 'Users',
        field: 'id'
      },
      onDelete: 'RESTRICT',  // o 'CASCADE'/'SET NULL'
      onUpdate: 'CASCADE'
    });
  }
};