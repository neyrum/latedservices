const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const { 
    createRequest, 
    updateRequestStatus, 
    getClientRequests,
    getRequestDetails,
    getAllRequests,
    exportRequestsReport, 
    exportRequestsExcel,
} = require('../controllers/request.controller');

// Para exportar reporte
router.get("/export", authenticate, authorize(["superadmin", "admin"]), exportRequestsReport);
router.get("/export/excel", authenticate, authorize(["superadmin", "admin"]), exportRequestsExcel);


// Rutas para clientes
router.post('/', authenticate, authorize(['superadmin','admin','client']), createRequest);
router.get('/client', authenticate, authorize([ 'superadmin', 'admin', 'client']), getClientRequests);
router.get('/:id', authenticate, authorize(['superadmin','admin', 'manager', 'client']), getRequestDetails);
router.get('/client/history', authenticate, authorize(['superadmin','admin','client']), getClientRequests);


// Rutas para administradores y managers
router.put('/:id/status', authenticate, authorize(['superadmin','admin', 'manager']), updateRequestStatus);
router.get("/", authenticate, authorize(["superadmin", "admin", "manager"]), getAllRequests);


module.exports = router;