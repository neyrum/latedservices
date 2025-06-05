const { Request, Service, User, sequelize } = require('../models'); // Asegúrate de importar sequelize
const { Op } = require('sequelize');
const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");
const emoji = require("emoji-img");
const fs = require("fs");

/**
 * @desc Crear nueva solicitud de servicio
 * @route POST /api/requests
 * @access Privado (Cliente)
 */
const createRequest = async (req, res) => {
  const transaction = await sequelize.transaction(); // Crear una transacción
  try {
    const { serviceId, details, preferredDate, facultyOrWorkIdentity, department } = req.body;

    console.log("Datos recibidos en el backend:", req.body); // Debug para verificar datos

    // 1. Verificar que el servicio exista y esté activo
    const service = await Service.findOne({
      where: { id: serviceId, isActive: true },
      transaction, // Asegurarse de que la consulta use la transacción
    });

    if (!service) {
      throw new Error('El servicio no existe o no está disponible');
    }

    // 2. Crear la solicitud
    const request = await Request.create(
      {
        userId: req.user.id,
        serviceId,
        details,
        preferredDate,
        facultyOrWorkIdentity: facultyOrWorkIdentity || null, // Manejo de valores opcionales
        department: department || null,
        status: 'pendiente',
      },
      { transaction }
    );

    // 3. Confirmar la transacción
    await transaction.commit();

    // 4. Obtener la solicitud con datos relacionados
    const fullRequest = await Request.findByPk(request.id, {
      include: [
        { model: User, as: 'client', attributes: ['id', 'name', 'email'] },
        { model: Service, as: 'service', attributes: ['id', 'name', 'price'] },
      ],
    });

    console.log("Solicitud guardada correctamente:", fullRequest); // Debug para verificar almacenamiento

    res.status(201).json({
      success: true,
      data: fullRequest,
      message: 'Solicitud creada exitosamente',
    });
  } catch (error) {
    // Revertir la transacción solo si no ha sido confirmada
    if (!transaction.finished) {
      await transaction.rollback();
    }

    console.error('Error al crear solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear la solicitud',
      error: error.message,
    });
  }
};

/**
 * @desc Actualizar estado de solicitud
 * @route PUT /api/requests/:id/status
 * @access Privado (Admin)
 */
const updateRequestStatus = async (req, res) => {
  const transaction = await sequelize.transaction(); // Crear una transacción
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    // Validar que el cuerpo de la solicitud no esté vacío
    if (!status) {
      throw new Error('El campo "status" es obligatorio');
    }

    // Validar estado permitido
    const validStatus = ['pendiente', 'aprobado','en_progreso', 'completado', 'cancelado', 'rechazado'];
    if (!validStatus.includes(status)) {
      throw new Error(`Estado inválido. Use: ${validStatus.join(', ')}`);
    }

    const request = await Request.findByPk(id, { transaction });

    if (!request) {
      throw new Error('Solicitud no encontrada');
    }

    // Validar transición de estados permitida
    const validTransitions = {
      pendiente: ['aprobado', 'rechazado'],
      aprobado: ['en_progreso'],
      en_progreso: ['completado', 'cancelado'],
      completado: [],
      cancelado: [],
      rechazado: [],
    };

    if (!validTransitions[request.status].includes(status)) {
      throw new Error(
        `Transición de estado no permitida (de ${request.status} a ${status})`
      );
    }

    // Actualizar solicitud
    await request.update(
      {
        status,
        assignedAdminId: req.user.id,
        adminNotes,
      },
      { transaction }
    );

    // Confirmar la transacción
    await transaction.commit();

    // Obtener solicitud actualizada con relaciones
    const fullRequest = await Request.findByPk(id, {
      include: [
        { model: User, as: 'client', attributes: ['id', 'name', 'email'] },
        { model: Service, as: 'service', attributes: ['id', 'name'] },
        { model: User, as: 'admin', attributes: ['id', 'name'] },
      ],
    });

    res.json({
      success: true,
      data: fullRequest,
      message: `Estado de solicitud actualizado a ${status}`,
    });
  } catch (error) {
    // Revertir la transacción solo si no ha sido confirmada
    if (!transaction.finished) {
      await transaction.rollback();
    }

    console.error('Error al actualizar estado:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const baseUrl = process.env.APP_URL; // 🔹 URL base del backend

// 🔹 Rutas de iconos
const reportIcon = "public/icons/report_icon.png";
const dateIcon = "public/icons/date_icon.png";
const facultyIcon = "public/icons/faculty_icon.png";
const workIcon = "public/icons/work_icon.png";
const departmentIcon = "public/icons/department_icon.png";
const serviceIcon = "public/icons/service_icon.png"; // 🔹 Icono para servicio
const statusIcon = "public/icons/status_icon.png"; // 🔹 Icono para estado
const clientIcon = "public/icons/client_icon.png";

/**
 * @desc Exportar reporte de solicitudes en PDF
 * @route GET /api/requests/export
 * @access Privado (Admin, Manager)
 */
const exportRequestsReport = async (req, res) => {
  try {
    const requests = await Request.findAll({
      include: [
        { model: User, as: "client", attributes: ["name", "email", "faculty", "area", "work_identity", "department"] },
        { model: Service, as: "service", attributes: ["name", "price"] }
      ],
      order: [["createdAt", "DESC"]],
    });

    if (!requests.length) return res.status(404).json({ message: "No hay solicitudes disponibles para el reporte." });

    // 🔹 Configurar el documento PDF
    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=reporte_clientes.pdf");

    doc.pipe(res);

    // 🔹 Título con ícono
    if (fs.existsSync(reportIcon)) doc.image(reportIcon, 50, doc.y, { width: 20, height: 20 });
    doc.fontSize(20).text("Reporte de Servicios Prestados", 80, doc.y);
    doc.moveDown();

    // 🔹 Fecha de generación con ícono
    if (fs.existsSync(dateIcon)) doc.image(dateIcon, 50, doc.y, { width: 15, height: 15 });
    doc.fontSize(14).text(`Generado el: ${new Date().toLocaleString()}`, 80, doc.y);
    doc.moveDown();

    requests.forEach((req, index) => {
      // 🔹 Separador de cada solicitud
      doc.strokeColor("black").lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();
      
      // 📌 Cliente con icono y en negritas
     if (fs.existsSync(clientIcon)) doc.image(clientIcon, 50, doc.y, { width: 15, height: 15 });
     doc.font("Helvetica-Bold").fontSize(14).text(`Cliente: ${req.client.name}`, 70, doc.y);
     doc.moveDown();

      // 📌 Facultad con icono
      if (fs.existsSync(facultyIcon)) doc.image(facultyIcon, 50, doc.y, { width: 15, height: 15 });
      doc.text(`Facultad/Área: ${req.client.faculty || "No especificado"}`, 70, doc.y);
      doc.moveDown();

      // 📌 Identidad Laboral con icono
      if (fs.existsSync(workIcon)) doc.image(workIcon, 50, doc.y, { width: 15, height: 15 });
      doc.text(`Identidad Laboral: ${req.client.work_identity || "No especificado"}`, 70, doc.y);
      doc.moveDown();

      // 📌 Departamento con icono
      if (fs.existsSync(departmentIcon)) doc.image(departmentIcon, 50, doc.y, { width: 15, height: 15 });
      doc.text(`Departamento: ${req.client.department || "No especificado"}`, 70, doc.y);
      doc.moveDown();

      // 🔹 Línea separadora entre datos del cliente y servicio
      doc.strokeColor("gray").lineWidth(0.5).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();

      // 📌 Servicio solicitado con icono
      if (fs.existsSync(serviceIcon)) doc.image(serviceIcon, 50, doc.y, { width: 15, height: 15 });
      doc.text(`Servicio Solicitado: ${req.service.name}`, 70, doc.y);
      doc.moveDown();

      // 📌 Estado del servicio con icono
      if (fs.existsSync(statusIcon)) doc.image(statusIcon, 50, doc.y, { width: 15, height: 15 });
      doc.text(`Estado: ${req.status || "Pendiente"}`, 70, doc.y);
      doc.moveDown();
    });

    doc.end();
  } catch (error) {
    console.error("❌ Error al generar el reporte:", error);
    res.status(500).json({ message: "Error interno al generar el reporte" });
  }
};

/**
 * @desc Exportar solicitudes a Excel
 * @route GET /api/requests/export/excel
 * @access Privado (Admin, Manager)
 */
const exportRequestsExcel = async (req, res) => {
  try {
    const requests = await Request.findAll({
      include: [{ model: Service, as: "service" }, { model: User, as: "client" }],
      order: [["createdAt", "DESC"]],
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Servicios Prestados");

    worksheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Cliente", key: "client", width: 25 },
      { header: "Facultad/Área", key: "faculty", width: 30 },
      { header: "Identidad Laboral", key: "work_identity", width: 25 },
      { header: "Departamento", key: "department", width: 20 },
      { header: "Servicio", key: "service", width: 30 },
      { header: "Estado", key: "status", width: 15 },
    ];

    requests.forEach((req) => {
      worksheet.addRow({
        id: req.id,
        client: req.client.name,
        faculty: req.client.faculty || "-",
        work_identity: req.client.work_identity || "-",
        department: req.client.department || "-",
        service: req.service.name,
        status: req.status,
      });
    });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=reporte.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("❌ Error al generar el reporte Excel:", error);
    res.status(500).json({ message: "Error al generar el reporte Excel" });
  }
};

/**
 * @desc Obtener solicitudes del cliente autenticado
 * @route GET /api/requests/client
 * @access Privado (Cliente)
 */
const getClientRequests = async (req, res) => {
  try {
    const { status } = req.query;

    const whereClause = {
      userId: req.user.id,
    };

    if (status) {
      whereClause.status = status;
    }

    const requests = await Request.findAll({
      where: whereClause,
      include: [
        {
          model: Service,
          as: 'service', // Alias correcto
          attributes: ['id', 'name', 'price'],
          where: { isActive: true },
        },
        {
          model: User,
          as: 'admin', // Alias correcto
          attributes: ['id', 'name'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: requests,
      count: requests.length,
    });
  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las solicitudes',
    });
  }
};

/**
 * @desc Obtener detalles de una solicitud
 * @route GET /api/requests/:id
 * @access Privado (Cliente dueño o Admin)
 */
const getRequestDetails = async (req, res) => {
  try {
    const request = await Request.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'client', // Alias correcto
          attributes: ['id', 'name', 'email', 'phone', 'faculty', 'work_identity', 'department'],
        },
        {
          model: Service,
          as: 'service', // Alias correcto
          attributes: ['id', 'name', 'description', 'price'],
        },
        {
          model: User,
          as: 'admin', // Alias correcto
          attributes: ['id', 'name'],
        },
      ],
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada',
      });
    }

    // Verificar permisos (cliente dueño o admin)
    if (req.user.role !== 'superadmin' && req.user.role !== 'admin'&& request.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No autorizado para ver esta solicitud',
      });
    }

    res.json({
      success: true,
      data: request,
    });
  } catch (error) {
    console.error('Error al obtener detalle:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el detalle de la solicitud',
    });
  }
};

/**
 * @desc Obtener todas las solicitudes (solo para administradores)
 * @route GET /api/requests
 * @access Privado (Admin)
 */
const getAllRequests = async (req, res) => {
  try {
    // Verificar si el usuario es administrador
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin' && req.user.role !== 'manager') {
      return res.status(403).json({
        success: false,
        message: 'No autorizado para acceder a esta información',
      });
    }

    // Obtener todas las solicitudes con datos relacionados
    const requests = await Request.findAll({
      include: [
        {
          model: User,
          as: 'client', // Alias correcto para el cliente
          attributes: ['id', 'name', 'email', 'faculty', 'work_identity', 'department'],
        },
        {
          model: Service,
          as: 'service', // Alias correcto para el servicio
          attributes: ['id', 'name', 'price'],
        },
        {
          model: User,
          as: 'admin', // Alias correcto para el administrador asignado
          attributes: ['id', 'name'],
        },
      ],
      order: [['createdAt', 'DESC']], // Ordenar por fecha de creación (más recientes primero)
    });

    res.json({
      success: true,
      data: requests,
      count: requests.length,
    });
  } catch (error) {
    console.error('Error al obtener todas las solicitudes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las solicitudes',
    });
  }
};

module.exports = {
  createRequest,
  updateRequestStatus,
  getClientRequests,
  getRequestDetails,
  getAllRequests,
  exportRequestsReport,
  exportRequestsExcel,
};