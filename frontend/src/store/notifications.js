import api from "../plugins/axios";

export default {
    namespaced: true,
    state: { notifications: [] },
    mutations: {
        SET_NOTIFICATIONS(state, notifications) {
            state.notifications = notifications;
        }
    },
    actions: {
        async fetchNotifications({ commit }) {
            try {
                const response = await api.get("/notifications");
                commit("SET_NOTIFICATIONS", response.data);
            } catch (error) {
                console.error("❌ Error obteniendo notificaciones:", error);
            }
        },
        async markAsRead({ dispatch }, notificationId) {
            try {
                await api.patch(`/notifications/${notificationId}/read`);
                dispatch("fetchNotifications"); // Refrescar lista después de marcar como leído
            } catch (error) {
                console.error("❌ Error marcando notificación como leída:", error);
            }
        }
    }
};
