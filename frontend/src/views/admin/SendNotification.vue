<template>
  <div class="send-notification">
    <h2>Enviar Notificación</h2>
    <form @submit.prevent="sendNotification">
      <div class="form-group">
        <label for="userId">ID del Usuario:</label>
        <input
          id="userId"
          type="number"
          v-model="userId"
          required
          class="form-control"
        />
      </div>

      <div class="form-group">
        <label for="message">Mensaje:</label>
        <textarea
          id="message"
          v-model="message"
          required
          class="form-control"
          rows="3"
        ></textarea>
      </div>

      <button type="submit" class="btn btn-primary">
        Enviar Notificación
      </button>
    </form>

    <div v-if="successMessage" class="alert alert-success mt-3">
      {{ successMessage }}
    </div>
    <div v-if="errorMessage" class="alert alert-danger mt-3">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script>
import axios from "@/plugins/axios";

export default {
  name: "SendNotification",
  data() {
    return {
      userId: "", // ID del usuario destinatario
      message: "", // Mensaje de la notificación
      successMessage: "",
      errorMessage: ""
    };
  },
  methods: {
    async sendNotification() {
      try {
        // Realiza la solicitud POST al endpoint /notifications/send
        await axios.post("/notifications/send", {
          userId: this.userId,
          message: this.message
        });

        // Si todo sale bien, muestra un mensaje de éxito y limpia el formulario
        this.successMessage = "Notificación enviada exitosamente.";
        this.errorMessage = "";
        this.userId = "";
        this.message = "";
      } catch (error) {
        console.error("Error enviando notificación:", error);
        this.errorMessage =
          "Ocurrió un error al enviar la notificación. Verifica los datos o intenta de nuevo.";
        this.successMessage = "";
      }
    }
  }
};
</script>

<style scoped>
.send-notification {
  max-width: 500px;
  margin: 20px auto;
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #fff;
}

.form-group {
  margin-bottom: 15px;
}

.btn {
  margin-top: 10px;
}
</style>
