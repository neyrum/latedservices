```markdown
. 📂 backend
└── 📂 config/
│  ├── 📄 config.js
└── 📂 controllers/
│  ├── 📄 audit.controller.js
│  ├── 📄 auth.controller.js
│  ├── 📄 rating.controller.js
│  ├── 📄 request.controller.js
│  ├── 📄 services.controller.js
│  ├── 📄 user.controller.js
└── 📂 middlewares/
│  ├── 📄 auth.middleware.js
│  ├── 📄 errorHandler.js
│  ├── 📄 permission.middleware.js
│  ├── 📄 role.middleware.js
│  ├── 📄 validateRating.js
└── 📂 migrations/
│  ├── 📄 20250423035217-create-service.js
│  ├── 📄 20250423063119-create-user.js
│  ├── 📄 20250423073630-add-role-to-users.js
│  ├── 📄 20250424181901-add-status-to-users.js
│  ├── 📄 20250424201059-add-reset-password-fields-to-users.js
│  ├── 📄 20250426112622-create-request.js
│  ├── 📄 20250426122352-add-created-by-to-services.js
│  ├── 📄 20250426125430-remove-duplicate-fk-from-services.js
│  ├── 📄 20250427042323-add-isActive-to-services.js
│  ├── 📄 20250428150700-add-preferred-date-to-requests.js
│  ├── 📄 20250428151828-add-address-to-requests.js
│  ├── 📄 20250428152311-add-deleted-at-to-requests.js
│  ├── 📄 20250428160112-add-assigned-admin-id-to-requests.js
│  ├── 📄 20250428165527-add-foreign-keys-to-requests.js
│  ├── 📄 20250428192240-add-phone-to-users.js
│  ├── 📄 20250429231510-create-ratings.js
│  ├── 📄 20250430025755-add-average-rating-to-services.js
│  ├── 📄 20250430142851-create-audit-log.js
│  ├── 📄 20250430161346-create-permission.js
│  ├── 📄 20250506110723-add-profile-picture-to-users.js
└── 📂 models/
│  ├── 📄 auditlog.js
│  ├── 📄 index.js
│  ├── 📄 permission.js
│  ├── 📄 rating.js
│  ├── 📄 request.js
│  ├── 📄 service.js
│  ├── 📄 user.js
├── 📄 nodemon.json
├── 📄 package.json
└── 📂 routes/
│  ├── 📄 audit.routes.js
│  ├── 📄 auth.routes.js
│  ├── 📄 rating.routes.js
│  ├── 📄 request.routes.js
│  ├── 📄 services.routes.js
│  ├── 📄 user.routes.js
└── 📂 seeders/
│  ├── 📄 20250430161805-seed-permissions.js
├── 📄 server.js
└── 📄 updateUserToSuperAdmin.js
```


// Sabe si el server está corriendo PostgreSQL
pg_ctl -D /usr/local/var/postgres status
pg_ctl -D /usr/local/var/postgres start

psql -h 127.0.0.1 -p 5432 -U root -d lated_services

SELECT * FROM "Users";

SELECT id, name, email, role, status FROM "Users";
SELECT id, name, email, role, status, phone, address FROM "Users";

SELECT id, name, price FROM "Services";


UPDATE users
SET status = 'activo'
WHERE role = 'superadmin';

copia seguridad de mi base datos
pg_dump -U root -d lated_services -F c -f backup.sql

Para restaurar la base de datos desde el archivo de respaldo
pg_restore -U root -d lated_services -F c backup.sql
