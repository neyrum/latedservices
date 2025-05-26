import { createRouter, createWebHistory } from "vue-router";
import store from "@/store";

// Vistas principales
import Home from "@/views/Home.vue";
import Login from "@/views/auth/Login.vue";
import Register from "@/views/auth/Register.vue";
import Dashboard from "@/views/admin/Dashboard.vue";
import Profile from "@/views/client/Profile.vue";
import RequestService from "@/views/client/RequestService.vue";
import RequestHistory from "@/views/client/RequestHistory.vue";
import RequestDetails from "@/views/admin/RequestDetails.vue"; 
import SendNotification from "@/views/admin/SendNotification.vue";

// Módulos dentro del Dashboard
import DashboardHome from "@/views/admin/DashboardHome.vue";
import ManageServices from "@/views/admin/ManageServices.vue";
import UsersManagement from "@/views/admin/UsersManagement.vue";
import AvailableServices from "@/views/client/AvailableServices.vue";

const routes = [
  { path: "/", name: "Home", component: Home },
  { path: "/login", name: "Login", component: Login },
  { path: "/register", name: "Register", component: Register },
  {
    path: "/dashboard",
    component: Dashboard,
    meta: { requiresAuth: true, role: ["admin", "superadmin", "user", "client"] },
    children: [
      { path: "", name: "DashboardHome", component: DashboardHome },
      { path: "manage-services", name: "ManageServices", component: ManageServices },
      { path: "users", name: "UsersManagement", component: UsersManagement },
    ],
  },
  {
    path: "/client/services",
    name: "AvailableServices",
    component: AvailableServices,
    meta: { requiresAuth: true, role: ["admin", "superadmin", "client"] },
  },
  { path: "/profile", name: "Profile", component: Profile, meta: { requiresAuth: true } },
  {
    path: "/request-service",
    name: "RequestService",
    component: RequestService,
    meta: { requiresAuth: true, role: ["admin", "superadmin", "client"] },
  },
  {
    path: "/request-history",
    name: "RequestHistory",
    component: RequestHistory,
    meta: { requiresAuth: true, role: ["admin", "superadmin", "client"] },
  },

  // Ruta para la vista de detalles de solicitud (nombre en minúsculas)
  {
    path: "/admin/requests/:id",
    name: "request-details",
    component: RequestDetails,
    meta: { requiresAuth: true, role: ["admin", "superadmin", "client"] },
  },
  {
      path: "/admin/send-notification",
      name: "SendNotification",
      component: SendNotification,
      meta: { requiresAuth: true, roles: ["admin", "superadmin"] } // Asegúrate de que solo administradores puedan acceder
    },
  { path: "/:pathMatch(.*)*", name: "NotFound", redirect: "/" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Middleware de protección de rutas
router.beforeEach(async (to, from, next) => {
  const isAuthenticated = store.getters["auth/isAuthenticated"];
  let userRole = store.getters["auth/userData"]?.role;

  // Si la ruta requiere autenticación y el usuario no está autenticado
  if (to.meta.requiresAuth && !isAuthenticated) {
    try {
      await store.dispatch("auth/validateToken");
      const updatedIsAuthenticated = store.getters["auth/isAuthenticated"];
      if (!updatedIsAuthenticated) return next("/login");
      // Actualizar el rol del usuario después de validar el token
      userRole = store.getters["auth/userData"]?.role;
    } catch {
      return next("/login");
    }
  }

  // Si la ruta requiere un rol específico y el usuario no tiene un rol permitido
  if (to.meta.role && !to.meta.role.includes(userRole)) {
    return next("/");
  }

  next();
});

export default router;
