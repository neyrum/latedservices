module.exports = {
    chainWebpack: (config) => {
      config.plugin('define').tap((definitions) => {
        definitions[0]['__VUE_OPTIONS_API__'] = true; // Habilita la Options API (cámbialo a false si solo usas Composition API)
        definitions[0]['__VUE_PROD_DEVTOOLS__'] = false; // Desactiva devtools en producción
        definitions[0]['__VUE_PROD_HYDRATION_MISMATCH_DETAILS__'] = false; // Desactiva detalles de hidratación en producción
        return definitions;
      });
    }
  };